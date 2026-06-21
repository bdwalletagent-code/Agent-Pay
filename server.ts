import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface AgentState {
  agentId: string;
  mainBalance: number;
  commissionBalance: number;
  totalEarned: number;
  requests: any[];
  balanceLogs: any[];
  commissionLogs: any[];
  notifications: any[];
  referrals: any[];
  refillRequests: any[];
  lastUpdated: string;
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Server-side simple DB state
let agentsDb: Record<string, AgentState> = {};
let globalRefillRequests: any[] = [];

// Load DB from file if it exists
const DB_FILE = path.join(process.cwd(), "db.json");
try {
  if (fs.existsSync(DB_FILE)) {
    const data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    agentsDb = data.agentsDb || {};
    globalRefillRequests = data.globalRefillRequests || [];
    console.log("DB loaded successfully. Loaded agents:", Object.keys(agentsDb).length);
  }
} catch (e) {
  console.log("Failed to load db.json, using in-memory state:", e);
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify({ agentsDb, globalRefillRequests }, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to save db.json:", e);
  }
}

// Ensure database registers any defaults / template updates
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", activeAgents: Object.keys(agentsDb) });
});

// Sync agent data with server
app.post("/api/agent/:agentId/sync", (req, res) => {
  const { agentId } = req.params;
  const clientState = req.body;

  if (!agentsDb[agentId]) {
    // Register agent on first sync
    agentsDb[agentId] = {
      agentId,
      mainBalance: clientState.mainBalance ?? 0,
      commissionBalance: clientState.commissionBalance ?? 0,
      totalEarned: clientState.totalCommissionEarned ?? 0,
      requests: clientState.requests ?? [],
      balanceLogs: clientState.balanceLogs ?? [],
      commissionLogs: clientState.commissionLogs ?? [],
      notifications: clientState.notifications ?? [],
      referrals: clientState.referrals ?? [],
      refillRequests: clientState.refillRequests ?? [],
      lastUpdated: new Date().toISOString()
    };
    saveDb();
  } else {
    const agent = agentsDb[agentId];

    // Merge transactions client-side if client-side has new simulations
    if (clientState.requests && clientState.requests.length > agent.requests.length) {
      agent.requests = clientState.requests;
    }
    if (clientState.balanceLogs && Array.isArray(clientState.balanceLogs)) {
      // Keep any server-side logs (e.g. refill approvals) and merge with client-side logs safely
      const serverLogIds = new Set(agent.balanceLogs.map(l => l.id));
      clientState.balanceLogs.forEach((log: any) => {
        if (!serverLogIds.has(log.id)) {
          agent.balanceLogs.push(log);
        }
      });
      // Sort descending by timestamp or id
      agent.balanceLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    if (clientState.commissionLogs && clientState.commissionLogs.length > agent.commissionLogs.length) {
      agent.commissionLogs = clientState.commissionLogs;
    }
    if (clientState.notifications && Array.isArray(clientState.notifications)) {
      const serverNotifIds = new Set(agent.notifications.map(n => n.id));
      clientState.notifications.forEach((notif: any) => {
        if (!serverNotifIds.has(notif.id)) {
          agent.notifications.push(notif);
        }
      });
      agent.notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    if (clientState.referrals && clientState.referrals.length > agent.referrals.length) {
      agent.referrals = clientState.referrals;
    }
    if (clientState.refillRequests && Array.isArray(clientState.refillRequests)) {
      // Sync refill requests
      const serverRefillIds = new Set(agent.refillRequests.map(r => r.id));
      clientState.refillRequests.forEach((request: any) => {
        if (!serverRefillIds.has(request.id)) {
          agent.refillRequests.push(request);
          // Also sync to global refill requests if not already there
          if (!globalRefillRequests.some(r => r.id === request.id)) {
            globalRefillRequests.push(request);
          }
        }
      });
    }

    // Handle standard balance synchronization:
    // If the client's balance decreased/increased because of a local deposit/withdrawal simulation,
    // we detect the variation from the stored value and apply the same delta, BUT only if no server-side refill credits were added.
    // To make it fully robust and foolproof:
    // We update the client if the server registered an active credit from the Super Agent.
    // If the server and client balances mismatch, we see if the server balance was incremented by a refill.
    // A robust way to implement this is that the client simply sends their local balance changes
    // EXCEPT when a new refill approval has occurred, in which case the client accepts the server's update.
    // Even simpler: The client balance is updated to the server's balance if the server's balance has been modified by the super agent.
    // Let's implement a clean state-of-truth:
    if (clientState.mainBalance !== undefined && clientState.mainBalance !== agent.mainBalance) {
      // If the client has a pending refill that is marked as approved on the server, we want the server's balance to prevail!
      // Check if there is any approved request in agent.refillRequests that was previously pending
      const serverApprovedIds = new Set(
        agent.refillRequests.filter(r => r.status === 'approved').map(r => r.id)
      );
      const clientPendingIds = new Set(
        (clientState.refillRequests || []).filter((r: any) => r.status === 'pending').map((r: any) => r.id)
      );
      
      const newlyApprovedRefillFound = [...serverApprovedIds].some(id => clientPendingIds.has(id));

      if (newlyApprovedRefillFound) {
        // Let server balance prevail! (since Super Agent approved a refill)
      } else {
        // Otherwise, client has done a local player deposit / trade, so client balance is authoritative
        agent.mainBalance = clientState.mainBalance;
      }
    }

    if (clientState.commissionBalance !== undefined) {
      agent.commissionBalance = clientState.commissionBalance;
    }
    if (clientState.totalEarned !== undefined) {
      agent.totalEarned = clientState.totalEarned;
    }

    agent.lastUpdated = new Date().toISOString();
    saveDb();
  }

  res.json(agentsDb[agentId]);
});

// Fetch all refill requests
app.get("/api/refill-requests", (req, res) => {
  res.json(globalRefillRequests);
});

// Post a new refill request
app.post("/api/refill-requests", (req, res) => {
  const newRequest = req.body;
  if (!newRequest || !newRequest.id) {
    return res.status(400).json({ error: "Invalid refill request data" });
  }

  if (!globalRefillRequests.some(r => r.id === newRequest.id)) {
    globalRefillRequests.push(newRequest);
  }

  // Also record in agent's state if already registered
  const agentId = newRequest.agentId;
  if (agentsDb[agentId]) {
    const rfList = agentsDb[agentId].refillRequests;
    if (!rfList.some(r => r.id === newRequest.id)) {
      rfList.push(newRequest);
    }
  }

  saveDb();
  res.json({ success: true, request: newRequest });
});

// Approve a refill request by ID
app.post("/api/refill-requests/:id/approve", (req, res) => {
  const { id } = req.params;
  const { amount, agentId, details } = req.body;

  console.log(`Approving refill request ${id} of amount ${amount} for agent ${agentId}`);

  // 1. Update status on global list
  const globalIndex = globalRefillRequests.findIndex(r => r.id === id);
  if (globalIndex !== -1) {
    globalRefillRequests[globalIndex].status = "approved";
  }

  // 2. Add balance, create ticket logs, and make notifications in target Agent's account
  if (!agentsDb[agentId]) {
    // Lazy initialize agent account on the server if they haven't synced yet
    agentsDb[agentId] = {
      agentId,
      mainBalance: 0,
      commissionBalance: 0,
      totalEarned: 0,
      requests: [],
      balanceLogs: [],
      commissionLogs: [],
      notifications: [],
      referrals: [],
      refillRequests: [],
      lastUpdated: new Date().toISOString()
    };
  }

  const agent = agentsDb[agentId];
  
  // Update request status on the agent's account
  const agentRefIndex = agent.refillRequests.findIndex(r => r.id === id);
  if (agentRefIndex !== -1) {
    agent.refillRequests[agentRefIndex].status = "approved";
  } else {
    // If not found in progress, add it
    agent.refillRequests.push({
      id,
      agentId,
      agentName: agentId,
      senderPhone: "",
      amount,
      paymentMethod: "bKash",
      screenshot: "",
      timestamp: new Date().toISOString(),
      status: "approved"
    });
  }

  // Increase the target agent's wallet balance
  const previousBalance = agent.mainBalance;
  agent.mainBalance += amount;

  // Add a balance log entry for the agent
  const logVal = {
    id: `blog_${Date.now()}`,
    type: "add_main_balance",
    amount,
    previousBalance: previousBalance,
    newBalance: agent.mainBalance,
    timestamp: new Date().toISOString(),
    details: details || `Wallet load approved by Super Agent: (MFS Refill #${id})`
  };
  agent.balanceLogs.unshift(logVal);

  // Generate verified notification for the agent
  const addedNotif = {
    id: `notif_${Date.now()}`,
    titleBn: "আপনার রিফিল অনুরোধ এপ্রুভ হয়েছে!",
    titleEn: "Merchant Wallet Refill Approved!",
    messageBn: `সুপার এজেন্ট আপনার ৳${amount.toLocaleString()} রিফিল সফলভাবে এপ্রুভ করেছেন। ওয়ালেটে ফান্ড জমা হয়েছে।`,
    messageEn: `The Super Agent verified and approved your refill of ৳${amount.toLocaleString()}. Credits has landed.`,
    timestamp: new Date().toISOString(),
    isRead: false
  };
  agent.notifications.unshift(addedNotif);

  saveDb();
  res.json({ success: true, mainBalance: agent.mainBalance });
});

// Reject a refill request by ID
app.post("/api/refill-requests/:id/reject", (req, res) => {
  const { id } = req.params;
  const { agentId } = req.body;

  const globalIndex = globalRefillRequests.findIndex(r => r.id === id);
  if (globalIndex !== -1) {
    globalRefillRequests[globalIndex].status = "rejected";
  }

  if (agentsDb[agentId]) {
    const agent = agentsDb[agentId];
    const agentRefIndex = agent.refillRequests.findIndex(r => r.id === id);
    if (agentRefIndex !== -1) {
      agent.refillRequests[agentRefIndex].status = "rejected";
    }
  }

  saveDb();
  res.json({ success: true });
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
