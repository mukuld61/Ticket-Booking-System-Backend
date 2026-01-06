const User = require("../models/userModel");
const { sendMail } = require("../config/mailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");


const createAgent = async (req, res) => {
  try {
    const { name, email, phone, location } = req.body;

    if (!name || !email)
      return res.status(400).json({ message: "Name and email are required" });
        // const plainPassword = crypto.randomBytes(4).toString("hex");
    const plainPassword = Math.random().toString(36).slice(-8);
    console.log('plain password', plainPassword)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // const comapredPassword = await bcrypt.compare(plainPassword, hashedPassword);
    // console.log('comapredPassword', comapredPassword, hashedPassword);

    const newAgent = await User.create({
      name,
      email,
      phone,
      password: plainPassword,
      location,
      role: "agent",
      Agentstatus: "active",
    }); 
    console.log('New Agent Created:', newAgent);  

    await sendMail(
      email,
      "Agent Account Created",
      `Hi ${name},\n\nYour agent account has been created successfully.\n\nLogin Email: ${email}\nPassword: ${plainPassword}\n\nPlease log in and change your password immediately.\n\nLocation: ${location || "Not specified"}\n\n- Ticket Booking Admin`
    );

    res.status(201).json({
      message: "Agent created successfully and credentials sent via email.",
      agent: {
        id: newAgent.id,
        name: newAgent.name,
        email: newAgent.email,
        phone: newAgent.phone,
        location: newAgent.location,
        role: newAgent.role,
        Agentstatus: newAgent.Agentstatus,
      },
    });
  } catch (error) {
    console.error("Create Agent Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllAgents = async (req, res) => {
  try {
    const agents = await User.findAll({
      where: { role: "agent" },
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "location",
        "Agentstatus", 
        "role",
        "createdAt",
      ],
      order: [["id", "ASC"]],
    });

    if (!agents.length)
      return res.status(404).json({ message: "No agents found" });

    res.status(200).json({
      message: "Agents fetched successfully",
      total: agents.length,
      agents,
    });
  } catch (error) {
    console.error("Get All Agents Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const updateAgentStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { Agentstatus } = req.body; 

      console.log("Incoming data:", id, Agentstatus);

    if (!["active", "inactive"].includes(Agentstatus)) {
      return res
        .status(400)
        .json({ message: "Invalid Agentstatus. Use 'active' or 'inactive'." });
    }

    const agent = await User.findOne({ where: { id, role: "agent" } });
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    agent.Agentstatus = Agentstatus;
    await agent.save();

    res.status(200).json({
      message: `Agent status updated to ${Agentstatus}`,
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        Agentstatus: agent.Agentstatus,
      },
    });
  } catch (error) {
    console.error("Update Agent Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await User.findOne({ where: { id, role: "agent" } });
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    await agent.destroy();

    res.status(200).json({ message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Delete Agent Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { createAgent, getAllAgents,  updateAgentStatus,   deleteAgent,};
