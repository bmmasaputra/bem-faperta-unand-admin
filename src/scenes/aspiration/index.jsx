import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Snackbar,
  useTheme,
} from "@mui/material";
import { Header } from "../../components";
import { DeleteOutline } from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";
import { tokens } from "../../theme";
import React, { useEffect, useState } from "react";

const URL = "https://bemfabe.vercel.app/api/v1";

const Aspiration = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [aspirations, setAspirations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchAspirations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${URL}/aspiration`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAspirations(data.data || []);
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Failed to fetch aspirations.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAspirations();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this aspiration?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/aspiration`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Failed to delete aspiration.",
          severity: "error",
        });
        setDeletingId(null);
        return;
      }
      setSnackbar({
        open: true,
        message: "Aspiration deleted successfully!",
        severity: "success",
      });
      setAspirations((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to delete aspiration.",
        severity: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box m="20px">
      <Header title="Aspiration" subtitle="Aspiration list received" />
      <Box mt={2} display="flex" flexDirection="column" gap={2}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={200}
          >
            <CircularProgress />
          </Box>
        ) : aspirations.length === 0 ? (
          <Typography color="text.secondary">No aspirations found.</Typography>
        ) : (
          aspirations.map((a) => (
            <Box
              key={a.id}
              p={2}
              borderRadius={2}
              backgroundColor={colors.primary[400]}
              boxShadow={1}
              display="flex"
              flexDirection="column"
              gap={1}
              position="relative"
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography fontWeight="bold">{a.subject}</Typography>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(a.id)}
                  disabled={deletingId === a.id}
                >
                  {deletingId === a.id ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <DeleteOutline />
                  )}
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {a.firstname} {a.lastname} &lt;{a.email}&gt;
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                {a.content}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(a.created_at).toLocaleString()}
              </Typography>
            </Box>
          ))
        )}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Aspiration;
