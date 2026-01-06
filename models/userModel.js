const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        is: /^[0-9+\-() ]{7,15}$/i,
      },
    },
    Agentstatus: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("admin", "agent"),
      defaultValue: "agent",
    },
    resetOtp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetOtpExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
User.beforeCreate(async (user) => {
  const plainPassword = user.password;
  const salt = await bcrypt.genSalt(10);
  console.log('Hashed Password before Create:', plainPassword);
  user.password = await bcrypt.hash(user.password, salt);
  console.log('Hashed Password after Create:', user.password);
  const compare = await bcrypt.compare(plainPassword, user.password);
  console.log('Password Match after Create:', compare);
  
});

module.exports = User;
