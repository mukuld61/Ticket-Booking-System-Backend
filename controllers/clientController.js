
const Client = require("../models/clientModel");
const sequelize = require("../config/db");


const createClient = async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;
    if (!name || !phone) return res.status(400).json({ message: "name and phone required" });

   
    const existing = await Client.findOne({ where: { phone } });
    if (existing) return res.status(409).json({ message: "Client already exists", client: existing });

    const client = await Client.create({
      name, email, phone, address, notes, createdBy: req.user?.id || null
    });
    return res.status(201).json({ message: "Client created", client });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getClients = async (req, res) => {
  try {
    const q = req.query.q || "";
 
    const where = q ? {
      [require("sequelize").Op.or]: [
        { name: { [require("sequelize").Op.like]: `%${q}%` } },
        { phone: { [require("sequelize").Op.like]: `%${q}%` } },
        { email: { [require("sequelize").Op.like]: `%${q}%` } }
      ]
    } : {};

    const clients = await Client.findAll({ where, order: [["createdAt","DESC"]] });
    res.status(200).json({ count: clients.length, clients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


const searchClients = async (req, res) => {
  try {
    const { query } = req.query; // frontend sends ?query=Ravi

    let clients;

    if (!query || query.trim() === "") {

      clients = await Client.findAll({
        attributes: ["id", "name", "phone", "email", "notes"],
        limit: 50, 
        order: [["createdAt", "DESC"]],
      });
    } else {
    
      clients = await Client.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `${query}%` } },
            { phone: { [Op.like]: `${query}%` } },
          ],
        },
        attributes: ["id", "name", "phone", "email", "notes"],
        limit: 50,
        order: [["createdAt", "DESC"]],
      });
    }

    res.status(200).json(clients);
  } catch (error) {
    console.error("Error searching clients:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateClientDetails = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { clientId } = req.params;
    const { name, email, phone } = req.body;

    const client = await Client.findByPk(clientId, { transaction: t });

    if (!client) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    await client.update(
      { name, email, phone },
      { transaction: t }
    );

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Client updated successfully",
      client
    });

  } catch (error) {
    await t.rollback();
    console.error("updateClientDetails error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

module.exports ={
  createClient,
  getClients ,
  searchClients,
  updateClientDetails
}