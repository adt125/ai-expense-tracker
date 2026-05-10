import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Box, IconButton, TextField } from "@mui/material";

export default function ChatInputBox({ sendMessage, chatInput, setChatInput }) {
  const handleChatSubmit = async (event) => {
    event.preventDefault();
    await sendMessage();
  };

  return (
    <Box component="form" onSubmit={handleChatSubmit} className="chat__form">
      <TextField
        name="chat-input"
        value={chatInput}
        onChange={(event) => setChatInput(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            sendMessage();
          }
        }}
        placeholder="Ask about spending, budgets, categories, or trends..."
        fullWidth
        multiline
        maxRows={4}
        variant="standard"
        InputProps={{ disableUnderline: true }}
        className="chat__input"
      />
      <Box className="chat__actions">
        <AutoAwesomeRoundedIcon className="chat__sparkle-icon" />
        <IconButton
          type="submit"
          disabled={!chatInput.trim()}
          className="chat__send-button"
        >
          <SendRoundedIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
