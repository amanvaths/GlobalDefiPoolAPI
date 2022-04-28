async function supportTicket(req, res) {
    try {
      const Ticket = require("../models/ticket");
      const { member_id, franchise_id, user_message } = req.body;
      let ticket = {}
      if (franchise_id) {
        ticket = new Ticket({
          franchise_id,
          user_message,
          role: "Franchise"
        });
      } else {
      ticket = new Ticket({
          member_id,
          user_message,
        });
      }
  
      ticket.save((error, data) => {
        if (error) {
          return res.status(400).json({
            message: "Somthing went wrong",
          });
        }
        if (data) {
          return res.status(200).json({
            message: "Message send..",
          });
        }
      });
    } catch (error) {
      console.log(
        "Error from: controller >> support >> supportTicket",
        error.message
      );
      return res.status(400).json({
        message: "Somthing went wrong",
      });
    }
  }
  
  async function getsupportTicket(req, res) {
    try {
      const Ticket = require("../models/ticket");
      const ticket = await Ticket.find(req.body);
      return res.status(200).json({
        ticket: ticket,
      });
    } catch (error) {
      console.log(
        "Error from: controller >> support >> getsupportTicket",
        error.message
      );
      return res.status(400).json({
        message: "Somthing went wrong",
      });
    }
  }
  
  async function support_ticket_admin_reply(req, res) {
    try {
      const Ticket = require("../models/ticket");
      const { admin_reply, _id } = req.body;
      const ticket = await Ticket.findById({ _id: _id });
      await Ticket.updateOne(
        { _id: _id },
        {
          $set: {
            admin_reply: admin_reply,
            status: 1,
          },
        }
      );
      return res.status(200).json({
        message: "You replyed",
      });
    } catch (error) {
      consoe.log(
        "Error from: controller >> support >> support_ticket_admin_reply",
        error.message
      );
      return res.status(400).json({
        message: "Somthing went wrong",
      });
    }
  }
  
  async function delete_ticket(req, res) {
    try {
      const Ticket = require("../models/ticket");
      Ticket.findOneAndDelete({ _id: req.body.id }).then((ticket, error) => {
        if (error) res.status(400).json({ message: error.message });
        res.status(200).json(ticket);
      });
    } catch (error) {
      console.log(
        "Error From: controller >> support >> delete_ticket",
        error.message
      );
      res.status(400).json({ message: "somthing went wrong" });
    }
  }
  module.exports = {
    supportTicket,
    getsupportTicket,
    support_ticket_admin_reply,
    delete_ticket,
  };
  