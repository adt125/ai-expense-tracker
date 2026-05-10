import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useContext, useEffect, useRef, useState } from "react";
import { ExpenseContext } from "../../context/ExpenseContext";
import "../../styles/Chat.css";
import ChatInputBox from "./ChatInputBox";
import ChatMessage from "./ChatMessage";

function createChatMessage(role, text, options = {}) {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id,
    role,
    text,
    loading: Boolean(options.loading),
  };
}

export default function ChatContainer() {
  const { fetchAgentResponse, sessionId } = useContext(ExpenseContext);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const chatMessagesRef = useRef(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const chatStorageKey = sessionId
    ? `expense_chat_messages_${sessionId}`
    : "expense_chat_messages";
  const chatInputStorageKey = sessionId
    ? `expense_chat_input_${sessionId}`
    : "expense_chat_input";
  const themeClassName = isDark ? "chat--dark" : "chat--light";

  useEffect(() => {
    const savedMessages = localStorage.getItem(chatStorageKey);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed)) {
          setChatMessages(parsed);
        }
      } catch {
        // ignore
      }
    }

    const savedInput = localStorage.getItem(chatInputStorageKey);
    if (typeof savedInput === "string") {
      setChatInput(savedInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatStorageKey, chatInputStorageKey]);

  useEffect(() => {
    localStorage.setItem(chatStorageKey, JSON.stringify(chatMessages));
  }, [chatMessages, chatStorageKey]);

  useEffect(() => {
    localStorage.setItem(chatInputStorageKey, chatInput);
  }, [chatInput, chatInputStorageKey]);

  const handleClearChat = () => {
    setChatInput("");
    setChatMessages([]);
    localStorage.removeItem(chatStorageKey);
    localStorage.removeItem(chatInputStorageKey);
  };

  const sendMessage = async () => {
    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage) return;

    setChatInput("");
    setChatMessages((currentMessages) => [
      ...currentMessages,
      createChatMessage("user", trimmedMessage),
    ]);
    await new Promise((res) => setTimeout(res, 1000));
    setChatMessages((prev) => [
      ...prev,
      createChatMessage("assistant", "Typing ...", { loading: true }),
    ]);

    const payload = {
      query: trimmedMessage,
    };

    const botResponse = await fetchAgentResponse(payload);

    setChatMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      updated[updated.length - 1] = {
        ...last,
        role: "assistant",
        text: botResponse.response,
        loading: false,
      };
      return updated;
    });
  };

  useEffect(() => {
    if (!chatMessagesRef.current) {
      return;
    }

    chatMessagesRef.current.scrollTo({
      top: chatMessagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatMessages]);

  return (
    <Paper className={`chat ${themeClassName}`}>
      <Box className="chat__header">
        <Typography variant="h6">Ask Expenso</Typography>
        <IconButton
          onClick={handleClearChat}
          aria-label="Clear chat"
          className="chat__clear-button"
        >
          <DeleteSweepRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box ref={chatMessagesRef} className="chat__messages">
        {chatMessages.map((message) => (
          <ChatMessage message={message} />
        ))}
      </Box>

      <ChatInputBox
        sendMessage={sendMessage}
        chatInput={chatInput}
        setChatInput={setChatInput}
      />
    </Paper>
  );
}
