import {
  Box,
  Typography,
  useTheme,
  Button,
  TextField,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { EditOutlined, DeleteOutline } from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useState, useEffect } from "react";
const URL = "https://bemfabe.vercel.app/api/v1";

const Admin = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Admin state
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({ id: "", username: "" });
  const [editAdmin, setEditAdmin] = useState(null);

  // Fetch admins
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/admin`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setAdmins(data.data || []);
    } catch {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Reset form when closing modal
  useEffect(() => {
    if (!openModal) {
      setEditAdmin(null);
      setForm({ id: "", username: "" });
    }
  }, [openModal]);

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit admin (open modal with data)
  const handleEditAdmin = (admin) => {
    setEditAdmin(admin);
    setForm({ id: admin.id, username: admin.username });
    setOpenModal(true);
  };

  // Handle save (edit only username)
  const handleSaveAdmin = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/admin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: form.id,
          username: form.username,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Failed to update admin.",
          severity: "error",
        });
        setSaving(false);
        return;
      }
      setSnackbar({
        open: true,
        message: "Admin updated successfully!",
        severity: "success",
      });
      setOpenModal(false);
      fetchAdmins();
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to update admin.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle revoke (delete admin)
  const handleRevokeAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this admin?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/admin`, {
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
          message: data.message || "Failed to revoke admin.",
          severity: "error",
        });
        setDeletingId(null);
        return;
      }
      setSnackbar({
        open: true,
        message: "Admin revoked successfully!",
        severity: "success",
      });
      fetchAdmins();
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to revoke admin.",
        severity: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // DataGrid columns
  const columns = [
    {
      field: "index",
      headerName: "No",
      width: 60,
      valueGetter: (params) => params.api.getAllRowIds().indexOf(params.id) + 1,
      sortable: false,
    },
    {
      field: "username",
      headerName: "Admin Username",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "action",
      headerName: "Action",
      width: 260,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<EditOutlined />}
            sx={{ minWidth: 70, fontWeight: 600, textTransform: "none" }}
            onClick={() => handleEditAdmin(params.row)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={
              deletingId === params.row.id ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <DeleteOutline />
              )
            }
            sx={{ minWidth: 70, fontWeight: 600, textTransform: "none" }}
            onClick={() => handleRevokeAdmin(params.row.id)}
            disabled={deletingId === params.row.id}
          >
            {deletingId === params.row.id ? "Revoking..." : "Revoke"}
          </Button>
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Box m="20px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Header title="Admins" subtitle="Managing all admins" />
      </Box>

      <Box
        height="70vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { border: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-iconSeparator": {
            color: colors.primary[100],
          },
        }}
      >
        <DataGrid
          rows={admins}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          autoHeight
          getRowId={(row) => row.id}
        />
      </Box>

      {/* Edit Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Edit Admin</DialogTitle>
        <form onSubmit={handleSaveAdmin}>
          <DialogContent>
            <TextField
              name="username"
              label="Admin Username"
              value={form.username}
              onChange={handleFormChange}
              required
              fullWidth
              sx={{
                mt: 1,
                input: {
                  background: colors.primary[600],
                  color: colors.gray[100],
                },
                label: { color: colors.gray[200] },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)} color="secondary">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
              startIcon={
                saving ? <CircularProgress size={18} color="inherit" /> : null
              }
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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

export default Admin;
