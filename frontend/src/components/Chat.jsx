import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useContext, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExpenseContext } from "../context/ExpenseContext";
import TypingIndicator from "./TypingIndicator";

const lowerCardHeight = { xs: 400, lg: "calc(100vh - 500px)" };

export default function Chat() {
  const { fetchAgentResponse } = useContext(ExpenseContext);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const chatMessagesRef = useRef(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const cardSurface = {
    background: isDark
      ? "linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(17,24,39,0.92) 100%)"
      : "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
    borderColor: isDark ? alpha("#94A3B8", 0.12) : "#E2E8F0",
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();
    const trimmedMessage = chatInput.trim();

    setChatInput("");
    setChatMessages((currentMessages) => [
      ...currentMessages,
      {
        role: "user",
        text: trimmedMessage,
      },
    ]);

    // Simulate delay (e.g. 1.5 seconds)
    await new Promise((res) => setTimeout(res, 1500));
    setChatMessages((prev) => [
      ...prev,
      { role: "assistant", text: "Typing ...", loading: true },
    ]);

    const payload = {
      query: trimmedMessage,
    };

    const botResponse = await fetchAgentResponse(payload);

    setChatMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        role: "assistant",
        text: botResponse.response,
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
    <Paper
      sx={{
        p: 3,
        height: lowerCardHeight,
        display: "flex",
        flexDirection: "column",
        ...cardSurface,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Ask Expenso
      </Typography>

      <Stack
        ref={chatMessagesRef}
        spacing={1.5}
        sx={{
          flex: 1,
          minHeight: 0,
          mb: 2,
          overflowY: "auto",
          pr: 0.5,
          "&::-webkit-scrollbar": {
            width: 6,
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 999,
            backgroundColor: alpha("#94A3B8", isDark ? 0.35 : 0.45),
          },
        }}
      >
        {chatMessages.map((message) => {
          const isUserMessage = message.role === "user";

          return (
            <Box
              key={message.id}
              sx={{
                alignSelf: isUserMessage ? "flex-end" : "flex-start",
                maxWidth: "86%",
                px: 1.75,
                py: 1.25,
                borderRadius: 3,
                bgcolor: isUserMessage
                  ? alpha("#0F766E", isDark ? 0.28 : 0.1)
                  : isDark
                    ? alpha("#94A3B8", 0.12)
                    : "#F1F5F9",
              }}
            >
              <Typography
                variant="body2"
                color={isUserMessage ? "text.primary" : "text.secondary"}
              >
                {message.loading ? (
                  <TypingIndicator />
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                  </ReactMarkdown>
                )}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      <Box
        component="form"
        onSubmit={handleChatSubmit}
        sx={{
          borderRadius: 999,
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          border: `1px solid ${alpha("#2DD4BF", isDark ? 0.32 : 0.22)}`,
          background: isDark
            ? "linear-gradient(90deg, rgba(71,85,105,0.24) 0%, rgba(45,212,191,0.18) 100%)"
            : "linear-gradient(90deg, rgba(248,250,252,0.95) 0%, rgba(204,251,241,0.55) 100%)",
        }}
      >
        <TextField
          name="chat-input"
          value={chatInput}
          onChange={(event) => setChatInput(event.target.value)}
          placeholder="Ask me about your April spending..."
          fullWidth
          multiline
          maxRows={4}
          variant="standard"
          InputProps={{ disableUnderline: true }}
          sx={{
            "& .MuiInputBase-root": {
              px: 1,
            },
          }}
        />
        <Stack direction="row" spacing={1} alignItems="center">
          <AutoAwesomeRoundedIcon sx={{ color: "#0F766E" }} />
          <IconButton
            type="submit"
            disabled={!chatInput.trim()}
            sx={{
              width: 42,
              height: 42,
              bgcolor: alpha("#0F766E", isDark ? 0.45 : 0.16),
              color: isDark ? "#D1FAE5" : "#0F766E",
              "&:hover": {
                bgcolor: alpha("#0F766E", isDark ? 0.6 : 0.24),
              },
              "&.Mui-disabled": {
                bgcolor: alpha("#0F766E", isDark ? 0.16 : 0.08),
                color: alpha(isDark ? "#D1FAE5" : "#0F766E", 0.45),
              },
            }}
          >
            <SendRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
}
