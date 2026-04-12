import { useContext } from "react";
import { ExpenseContext } from "../context/ExpenseContext";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

export default function ReportCard() {
  const { report } = useContext(ExpenseContext);

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom>
        Monthly Health Report
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={2}>
        {report?.summary ||
          "Connect your account and add expenses to generate an AI-backed report."}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {report?.advice?.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemText primary={`• ${item}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
