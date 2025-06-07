import {
  Box,
  useTheme,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import { Header } from "../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import {
  EditOutlined,
  DeleteOutline,
  AddCircleOutline,
  UploadFile,
} from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";
import React, { useEffect, useRef, useState } from "react";

const URL = "https://bemfabe.vercel.app/api/v1";

const UKM = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [ukms, setUkms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [editUkm, setEditUkm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    url_link: "",
    logo_url: "",
  });

  // For image upload
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const fileInputRef = useRef();

  // Fetch all UKM
  useEffect(() => {
    if (!showForm) {
      const fetchUkms = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${URL}/ukm`);
          const data = await res.json();
          setUkms(data.data || []);
        } catch (err) {
          setUkms([]);
          setSnackbar({
            open: true,
            message: "Failed to fetch UKM data.",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchUkms();
    }
  }, [showForm]);

  // Handle add new UKM button
  const handleAddUkm = () => {
    setIsAddMode(true);
    setEditUkm(null);
    setForm({
      id: "",
      name: "",
      description: "",
      url_link: "",
      logo_url: "",
    });
    setLogoFile(null);
    setLogoPreview("");
    setShowForm(true);
  };

  // Handle edit button click
  const handleEditUkm = (row) => {
    setIsAddMode(false);
    setEditUkm(row);
    setForm({
      id: row.id,
      name: row.name,
      description: row.description,
      url_link: row.url_link,
      logo_url: row.logo_url,
    });
    setLogoFile(null);
    setLogoPreview(row.logo_url || "");
    setShowForm(true);
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target.result);
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  // Handle save UKM (edit)
  const handleSaveUkm = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      // 1. Update UKM data (PUT)
      const res = await fetch(`${URL}/ukm`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: form.id,
          name: form.name,
          description: form.description,
          url_link: form.url_link,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Failed to edit UKM.",
          severity: "error",
        });
        setSaving(false);
        return;
      }

      // 2. If logoFile exists, update logo (PUT /ukm/logo)
      if (logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);
        formData.append("id", form.id);
        const logoRes = await fetch(`${URL}/ukm/logo`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const logoData = await logoRes.json();
        if (!logoRes.ok) {
          setSnackbar({
            open: true,
            message: logoData.message || "Failed to update logo.",
            severity: "error",
          });
          setSaving(false);
          return;
        }
        // Update logo_url in state
        setUkms((prev) =>
          prev.map((u) =>
            u.id === form.id
              ? { ...u, ...data.data, logo_url: logoData.data.logo_url }
              : u
          )
        );
      } else {
        setUkms((prev) =>
          prev.map((u) => (u.id === form.id ? { ...u, ...data.data } : u))
        );
      }

      setSnackbar({
        open: true,
        message: "UKM updated successfully!",
        severity: "success",
      });
      setShowForm(false);
      setEditUkm(null);
      setForm({
        id: "",
        name: "",
        description: "",
        url_link: "",
        logo_url: "",
      });
      setLogoFile(null);
      setLogoPreview("");
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to edit UKM.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle save new UKM (add)
  const handleAddUkmSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!form.name || !form.description || !form.url_link || !logoFile) {
      setSnackbar({
        open: true,
        message: "Lengkapi semua data UKM dan upload logo.",
        severity: "error",
      });
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("logo", logoFile);
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("url_link", form.url_link);

      const res = await fetch(`${URL}/ukm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Failed to add UKM.",
          severity: "error",
        });
        setSaving(false);
        return;
      }
      setSnackbar({
        open: true,
        message: "UKM added successfully!",
        severity: "success",
      });
      setShowForm(false);
      setForm({
        id: "",
        name: "",
        description: "",
        url_link: "",
        logo_url: "",
      });
      setLogoFile(null);
      setLogoPreview("");
      setUkms((prev) => [...prev, data.data]);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to add UKM.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle delete UKM
  const handleDeleteUkm = async (id) => {
    if (!window.confirm("Are you sure you want to delete this UKM?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/ukm`, {
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
          message: data.message || "Failed to delete UKM.",
          severity: "error",
        });
        setDeletingId(null);
        return;
      }
      setSnackbar({
        open: true,
        message: "UKM deleted successfully!",
        severity: "success",
      });
      setUkms((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to delete UKM.",
        severity: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // DataGrid columns
  const columns = [
    {
      field: "no",
      headerName: "No",
      width: 60,
      valueGetter: (params) =>
        ukms.findIndex((d) => d.id === params.row.id) + 1,
      sortable: false,
      filterable: false,
    },
    {
      field: "logo_url",
      headerName: "Logo",
      width: 80,
      renderCell: (params) =>
        params.value ? (
          <img
            src={params.value}
            alt="logo"
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
        ) : (
          "-"
        ),
      sortable: false,
      filterable: false,
    },
    {
      field: "name",
      headerName: "Name",
      width: 150,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "url_link",
      headerName: "URL",
      width: 180,
      renderCell: (params) =>
        params.value ? (
          <a
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: theme.palette.mode === "dark" ? "#fff" : "#111",
              fontWeight: 600,
              textDecoration: "underline",
              wordBreak: "break-all",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
              maxWidth: 160, // slightly less than column width for padding
            }}
            title={params.value}
          >
            {params.value}
          </a>
        ) : (
          "-"
        ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 210,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<EditOutlined />}
            sx={{ minWidth: 70, fontWeight: 600, textTransform: "none" }}
            onClick={() => handleEditUkm(params.row)}
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
            onClick={() => handleDeleteUkm(params.row.id)}
            disabled={deletingId === params.row.id}
          >
            {deletingId === params.row.id ? "Deleting..." : "Delete"}
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
        mb={0}
      >
        <Header title="UKM" subtitle="List of UKM" />
        {!showForm && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddCircleOutline />}
            sx={{
              bgcolor: colors.blueAccent[700],
              color: "#fff",
              fontWeight: 600,
              ":hover": { bgcolor: colors.blueAccent[800] },
            }}
            onClick={handleAddUkm}
          >
            Add New UKM
          </Button>
        )}
      </Box>
      {showForm ? (
        <Box
          component="form"
          onSubmit={isAddMode ? handleAddUkmSubmit : handleSaveUkm}
          bgcolor={colors.primary[400]}
          p={4}
          borderRadius={2}
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          gap={4}
          maxWidth={900}
          mx="auto"
        >
          {/* Left: UKM Form */}
          <Box flex={1} display="flex" flexDirection="column" gap={2}>
            <Typography variant="h5" fontWeight="bold" mb={1}>
              {isAddMode ? "Add New UKM" : "Edit UKM"}
            </Typography>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              required
              fullWidth
              sx={{ background: colors.primary[600] }}
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              required
              multiline
              minRows={3}
              fullWidth
              sx={{ background: colors.primary[600] }}
            />
            <TextField
              label="URL Link"
              name="url_link"
              value={form.url_link}
              onChange={handleFormChange}
              required
              fullWidth
              sx={{ background: colors.primary[600] }}
            />
            <Box display="flex" gap={2} mt={2}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setShowForm(false);
                  setIsAddMode(false);
                  setLogoFile(null);
                  setLogoPreview("");
                }}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={saving}
                startIcon={
                  saving ? <CircularProgress size={18} color="inherit" /> : null
                }
              >
                {saving ? "Saving..." : isAddMode ? "Add" : "Save"}
              </Button>
            </Box>
          </Box>
          {/* Right: Logo Upload & Preview */}
          <Box
            flex={0.8}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="flex-start"
            gap={2}
            sx={{
              background: colors.primary[600],
              borderRadius: 2,
              p: 3,
              minWidth: 220,
              maxWidth: 300,
            }}
          >
            <Typography fontWeight="bold" mb={1}>
              Logo UKM
            </Typography>
            <Box
              sx={{
                width: 180,
                height: 180,
                border: `2px dashed ${colors.blueAccent[400]}`,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                background: colors.primary[500],
              }}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Typography color={colors.gray[300]} fontSize={14}>
                  No Logo
                </Typography>
              )}
            </Box>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleLogoChange}
            />
            <Button
              variant="contained"
              color="info"
              startIcon={<UploadFile />}
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
              sx={{ fontWeight: 600, mt: 1 }}
              component="span"
            >
              {logoPreview ? "Change Logo" : "Upload Logo"}
            </Button>
            {logoFile && (
              <Typography fontSize={12} color={colors.greenAccent[400]}>
                {logoFile.name}
              </Typography>
            )}
          </Box>
        </Box>
      ) : (
        <Box
          mt="0px"
          height="75vh"
          maxWidth="100%"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              border: "none",
            },
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
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.gray[100]} !important`,
            },
          }}
        >
          <DataGrid
            rows={ukms}
            columns={columns}
            loading={loading}
            components={{ Toolbar: GridToolbar }}
            getRowId={(row) => row.id}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            disableSelectionOnClick
          />
        </Box>
      )}
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

export default UKM;
