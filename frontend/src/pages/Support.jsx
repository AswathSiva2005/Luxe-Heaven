import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Support.css";

export default function Support() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "buyer";

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [subject, setSubject] = useState("");
  const [createMessage, setCreateMessage] = useState("");
  const [createAttachments, setCreateAttachments] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAttachments, setReplyAttachments] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTickets();
    if (role === "buyer" || role === "user") {
      fetchBuyerOrders();
    }
  }, [token, navigate]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/support/tickets");
      setTickets(res.data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      alert("Unable to fetch support tickets");
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!selectedOrderId) {
      return alert("Please select the order related to this issue.");
    }

    if (!subject.trim() || !createMessage.trim()) {
      return alert("Subject and message are required");
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("message", createMessage);
    formData.append("orderId", selectedOrderId);
    if (createAttachments) {
      Array.from(createAttachments).forEach((file) => {
        formData.append("attachments", file);
      });
    }

    try {
      setLoading(true);
      await api.post("/support/tickets", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSubject("");
      setCreateMessage("");
      setCreateAttachments(null);
      setSelectedOrderId("");
      fetchTickets();
      alert("Support ticket created. Our team will respond soon.");
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Unable to create support ticket");
    } finally {
      setLoading(false);
    }
  };

  const fetchBuyerOrders = async () => {
    try {
      const res = await api.get("/orders");
      setBuyerOrders(res.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders for support:", error);
    }
  };

  const loadTicket = (ticket) => {
    fetchTicketDetail(ticket._id);
  };

  const fetchTicketDetail = async (ticketId) => {
    try {
      setLoading(true);
      const res = await api.get(`/support/tickets/${ticketId}`);
      setSelectedTicket(res.data.ticket);
    } catch (error) {
      console.error("Error fetching ticket detail:", error);
      alert("Unable to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selectedTicket) return;
    if (!replyMessage.trim()) {
      return alert("Please enter a message to send.");
    }

    const formData = new FormData();
    formData.append("message", replyMessage);
    if (replyAttachments) {
      Array.from(replyAttachments).forEach((file) => {
        formData.append("attachments", file);
      });
    }

    try {
      setLoading(true);
      const res = await api.post(
        `/support/tickets/${selectedTicket._id}/messages`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setReplyMessage("");
      setReplyAttachments(null);
      await Promise.all([fetchTickets(), fetchTicketDetail(res.data.ticket._id)]);
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Unable to send message");
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (status) => {
    if (!selectedTicket) return;

    try {
      setUpdatingStatus(true);
      await api.put(`/support/tickets/${selectedTicket._id}/status`, { status });
      await Promise.all([fetchTickets(), fetchTicketDetail(selectedTicket._id)]);
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.msg || "Unable to update ticket status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const roleLabel = (sender) => {
    if (sender === "admin") return "Support Team";
    if (sender === "seller") return role === "seller" ? "You (Seller)" : "Seller";
    return sender === "user" ? (role === "buyer" || role === "user" ? "You" : "Buyer") : sender;
  };

  const canResolve =
    (role === "seller" || role === "admin") &&
    selectedTicket &&
    !["Resolved", "Closed"].includes(selectedTicket.status);

  return (
    <div className="support-page">
      <div className="support-header">
        <h2>{role === "seller" ? "Seller Support Inbox" : "Customer Support"}</h2>
        <p>
          {role === "seller"
            ? "Review buyer issues assigned to your products, reply quickly, and mark them resolved."
            : "Raise a ticket and attach photos if there is a damaged or missing item."}
        </p>
      </div>

      <div className="support-content">
        <div className="support-sidebar">
          {(role === "buyer" || role === "user") && (
            <div className="support-form">
              <h3>Create a ticket</h3>
              <label>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Order damaged / Missing item..."
              />
              <label>Related Order</label>
              <select value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}>
                <option value="">Select an order</option>
                {buyerOrders.map((order) => (
                  <option key={order._id} value={order._id}>
                    #{order._id.slice(-8).toUpperCase()} - {new Date(order.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <label>Message</label>
              <textarea
                value={createMessage}
                onChange={(e) => setCreateMessage(e.target.value)}
                placeholder="Describe the issue..."
                rows={4}
              />
              <label>Attach photos (optional)</label>
              <input
                type="file"
                multiple
                onChange={(e) => setCreateAttachments(e.target.files)}
              />
              <button className="btn-submit" onClick={createTicket} disabled={loading}>
                {loading ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          )}

          <div className="ticket-list">
            <h3>{role === "seller" ? "Assigned Tickets" : "Your Tickets"}</h3>
            {loading ? (
              <p>Loading...</p>
            ) : tickets.length === 0 ? (
              <p>{role === "seller" ? "No assigned tickets yet." : "No tickets yet. Start by creating one."}</p>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className={`ticket-item ${selectedTicket?._id === ticket._id ? "active" : ""}`}
                  onClick={() => loadTicket(ticket)}
                >
                  <strong>{ticket.subject}</strong>
                  <span className="ticket-status">{ticket.status}</span>
                  {ticket.userId?.name && <small>Buyer: {ticket.userId.name}</small>}
                  {ticket.productId?.name && <small>Product: {ticket.productId.name}</small>}
                  <small>{new Date(ticket.createdAt).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="ticket-detail">
          {selectedTicket ? (
            <>
              <div className="ticket-detail-header">
                <h3>{selectedTicket.subject}</h3>
                <span className="ticket-status">{selectedTicket.status}</span>
              </div>

              <div className="ticket-meta-row">
                {selectedTicket.userId?.name && <span><strong>Buyer:</strong> {selectedTicket.userId.name}</span>}
                {selectedTicket.sellerId?.name && <span><strong>Seller:</strong> {selectedTicket.sellerId.name}</span>}
                {selectedTicket.productId?.name && <span><strong>Product:</strong> {selectedTicket.productId.name}</span>}
              </div>

              {canResolve && (
                <div className="status-actions">
                  <button disabled={updatingStatus} onClick={() => updateTicketStatus("Pending")}>Mark Pending</button>
                  <button disabled={updatingStatus} onClick={() => updateTicketStatus("Resolved")}>Mark Resolved</button>
                  <button disabled={updatingStatus} onClick={() => updateTicketStatus("Closed")}>Close Ticket</button>
                </div>
              )}

              <div className="message-thread">
                {selectedTicket.messages?.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.sender}`}>
                    <div className="message-meta">
                      <strong>{roleLabel(msg.sender)}</strong>
                      <span>{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <p>{msg.message}</p>
                    {msg.attachments?.length > 0 && (
                      <div className="attachments">
                        {msg.attachments.map((file) => (
                          <a
                            key={file}
                            href={`http://13.51.86.174:5000/uploads/support/${file}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {file}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="reply-box">
                <h4>Send a reply</h4>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Write a reply..."
                  rows={4}
                />
                <input
                  type="file"
                  multiple
                  onChange={(e) => setReplyAttachments(e.target.files)}
                />
                <button className="btn-submit" onClick={sendReply} disabled={loading}>
                  {loading ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">Select a ticket to view conversation.</div>
          )}
        </div>
      </div>
    </div>
  );
}
