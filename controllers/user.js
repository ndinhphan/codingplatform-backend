const userRouter = require("express").Router();

const { getDb } = require("../config/database");

const db = getDb();

const { User } = db;
