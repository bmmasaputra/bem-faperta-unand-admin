import {
  Box,
  Typography,
  useTheme,
  Button,
  IconButton,
  Chip,
  Paper,
  Autocomplete,
  TextField,
} from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import {
  EditOutlined,
  DeleteOutline,
  CheckCircle,
  PauseCircle,
} from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useState, useEffect } from "react";
const URL = "https://bemfabe.vercel.app/api/v1";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [kabinets, setKabinets] = useState([]);
  const [activeKabinetId, setActiveKabinetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Add kabinet form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    visi: "",
    misi: ["", "", "", ""],
    logo: null,
    image: null,
    gubernur_id: "",
    wakil_id: "",
  });
  const [pengurusList, setPengurusList] = useState([]);

  // Tambahkan state untuk preview logo dan image
  const [logoPreview, setLogoPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Tambahkan state untuk edit
  const [editKabinet, setEditKabinet] = useState(null);

  // Fetch pengurus for dropdown
  useEffect(() => {
    const fetchPengurus = async () => {
      try {
        const res = await fetch(`${URL}/pengurus`);
        const data = await res.json();
        setPengurusList(data.data || []);
      } catch {
        setPengurusList([]);
      }
    };
    if (showAddForm) fetchPengurus();
  }, [showAddForm]);

  // Fetch all kabinets and active kabinet id
  useEffect(() => {
    if (showAddForm) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const kabinetRes = await fetch(`${URL}/kabinet`, {
          headers: { "Content-Type": "application/json" },
        });
        const kabinetData = await kabinetRes.json();
        setKabinets(kabinetData.data);

        const profileRes = await fetch(`${URL}/profile`, {
          headers: { "Content-Type": "application/json" },
        });
        const profileData = await profileRes.json();
        const activeId = profileData.data?.kabinet?.id;
        setActiveKabinetId(activeId);
      } catch (error) {
        setKabinets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showAddForm]);

  // Fetch all kabinets and active kabinet id
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all kabinets
        const kabinetRes = await fetch(`${URL}/kabinet`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const kabinetData = await kabinetRes.json();
        setKabinets(kabinetData.data);

        // Fetch profile to get active kabinet id
        const profileRes = await fetch(`${URL}/profile`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const profileData = await profileRes.json();
        const activeId = profileData.data?.kabinet?.id;

        setActiveKabinetId(activeId);
      } catch (error) {
        setKabinets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset preview saat cancel/tambah baru
  useEffect(() => {
    if (!showAddForm) {
      setLogoPreview(null);
      setImagePreview(null);
    }
  }, [showAddForm]);

  // Update handleFormChange agar preview pakai FileReader (bukan URL.createObjectURL)
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo" && files && files[0]) {
      setForm((prev) => ({ ...prev, logo: files[0] }));
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target.result);
      reader.readAsDataURL(files[0]);
    } else if (name === "image" && files && files[0]) {
      setForm((prev) => ({ ...prev, image: files[0] }));
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(files[0]);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Reset edit state and form saat cancel/tambah baru
  useEffect(() => {
    if (!showAddForm) {
      setLogoPreview(null);
      setImagePreview(null);
      setEditKabinet(null);
      setForm({
        name: "",
        visi: "",
        misi: ["", "", "", ""],
        logo: null,
        image: null,
        gubernur_id: "",
        wakil_id: "",
      });
    }
  }, [showAddForm]);

  // Handle misi change
  const handleMisiChange = (idx, value) => {
    setForm((prev) => {
      const misi = [...prev.misi];
      misi[idx] = value;
      return { ...prev, misi };
    });
  };

  // Add/remove misi field
  const addMisiField = () =>
    setForm((prev) => ({ ...prev, misi: [...prev.misi, ""] }));
  const removeMisiField = (idx) =>
    setForm((prev) => ({
      ...prev,
      misi:
        prev.misi.length > 1
          ? prev.misi.filter((_, i) => i !== idx)
          : prev.misi,
    }));

  // Convert misi array to HTML ordered list
  const misiToHtml = (arr) => {
    const items = arr.filter((m) => m.trim()).map((m) => `<li>${m}</li>`);
    return `<ol>\n  ${items.join("\n  ")}\n</ol>`;
  };

  const handleDeleteKabinet = async (id) => {
    if (!window.confirm("Are you sure you want to delete this kabinet?"))
      return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/kabinet`, {
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
          message: data.message || "Failed to delete kabinet.",
          severity: "error",
        });
        setDeletingId(null);
        return;
      }
      setSnackbar({
        open: true,
        message: "Kabinet deleted successfully!",
        severity: "success",
      });
      reloadKabinetData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to delete kabinet.",
        severity: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Saat klik Edit, populate form dan tampilkan form edit
  const handleEditKabinet = (kabinet) => {
    setForm({
      name: kabinet.name || "",
      visi: kabinet.visi || "",
      misi: Array.isArray(kabinet.misi)
        ? kabinet.misi
        : kabinet.misi
        ? Array.from(
            new DOMParser()
              .parseFromString(kabinet.misi, "text/html")
              .querySelectorAll("li")
          ).map((li) => li.textContent)
        : ["", "", "", ""],
      logo: null,
      image: null,
      gubernur_id:
        kabinet.gubernur_id || kabinet.pengurus_kabinet_gubernur_id || "",
      wakil_id: kabinet.wakil_id || kabinet.pengurus_kabinet_wakil_id || "",
    });
    setLogoPreview(kabinet.logo_url || null);
    setImagePreview(kabinet.kabinet_img_url || null);
    setEditKabinet({
      ...kabinet,
      logo_url: kabinet.logo_url || null,
      image_url: kabinet.kabinet_img_url || null,
    });
    setShowAddForm(true);
  };  

  // Handle save kabinet (add/edit)
  const handleSaveKabinet = async (e) => {
    e.preventDefault();
    setSaving(true);
  
    // Helper untuk fetch file dari url dan convert ke File
    async function urlToFile(url, filename) {
      const res = await fetch(url);
      const blob = await res.blob();
      // Ekstensi dari url atau fallback ke jpg/png
      const ext = url.split(".").pop().split("?")[0];
      const mime = blob.type || (ext === "png" ? "image/png" : "image/jpeg");
      return new File([blob], filename, { type: mime });
    }
  
    const formData = new FormData();
  
    // Logo
    if (form.logo) {
      formData.append("logo", form.logo);
    } else if (editKabinet && editKabinet.logo_url) {
      const file = await urlToFile(editKabinet.logo_url, "logo.jpg");
      formData.append("logo", file);
    }
  
    // Image
    if (form.image) {
      formData.append("image", form.image);
    } else if (editKabinet && editKabinet.image_url) {
      const file = await urlToFile(editKabinet.image_url, "image.jpg");
      formData.append("image", file);
    }
  
    if (editKabinet) formData.append("id", editKabinet.id);
    formData.append("name", form.name);
    formData.append("visi", form.visi);
    formData.append("misi", misiToHtml(form.misi));
    formData.append("gubernur_id", form.gubernur_id);
    formData.append("wakil_id", form.wakil_id);
  
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/kabinet`, {
        method: editKabinet ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        setSnackbar({
          open: true,
          message:
            errData.message ||
            `Failed to ${editKabinet ? "edit" : "add"} kabinet.`,
          severity: "error",
        });
        setSaving(false);
        return;
      }
      setSnackbar({
        open: true,
        message: `Kabinet ${editKabinet ? "updated" : "added"} successfully!`,
        severity: "success",
      });
      setShowAddForm(false);
      setEditKabinet(null);
      setForm({
        name: "",
        visi: "",
        misi: ["", "", "", ""],
        logo: null,
        image: null,
        gubernur_id: "",
        wakil_id: "",
      });
      reloadKabinetData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Network error. Failed to ${
          editKabinet ? "edit" : "add"
        } kabinet.`,
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset edit state saat cancel/tambah baru
  useEffect(() => {
    if (!showAddForm) {
      setLogoPreview(null);
      setImagePreview(null);
      setEditKabinet(null);
    }
  }, [showAddForm]);

  // Helper to reload kabinet data
  const reloadKabinetData = async () => {
    setLoading(true);
    try {
      const kabinetRes = await fetch(`${URL}/kabinet`, {
        headers: { "Content-Type": "application/json" },
      });
      const kabinetData = await kabinetRes.json();
      setKabinets(kabinetData.data);

      const profileRes = await fetch(`${URL}/profile`, {
        headers: { "Content-Type": "application/json" },
      });
      const profileData = await profileRes.json();
      const activeId = profileData.data?.kabinet?.id;
      setActiveKabinetId(activeId);
    } catch (error) {
      setKabinets([]);
    } finally {
      setLoading(false);
    }
  };

  // Define columns for DataGrid
  const columns = [
    {
      field: "index",
      headerName: "No",
      width: 60,
      valueGetter: (params) => params.api.getAllRowIds().indexOf(params.id) + 1,
      sortable: false,
    },
    {
      field: "name",
      headerName: "Kabinet Name",
      flex: 0.8,
      minWidth: 120,
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 140,
      renderCell: (params) =>
        params.row.id === activeKabinetId ? (
          <Paper
            elevation={2}
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: colors.greenAccent[700],
              color: "#fff",
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              gap: 1,
              fontWeight: "bold",
            }}
          >
            <CheckCircle sx={{ fontSize: 20, color: "#fff" }} />
            Active
          </Paper>
        ) : (
          <Paper
            elevation={1}
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: colors.gray[700],
              color: "#fff",
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              gap: 1,
              fontWeight: "bold",
            }}
          >
            <PauseCircle sx={{ fontSize: 20, color: "#fff" }} />
            Inactive
          </Paper>
        ),
      sortable: false,
    },
    {
      field: "gubernur",
      headerName: "Gubernur & Wakil",
      flex: 1.2,
      minWidth: 180,
      renderCell: (params) => {
        const {
          pengurus_kabinet_gubernur_idTopengurus,
          pengurus_kabinet_wakil_idTopengurus,
        } = params.row;

        return (
          <Box>
            <Typography fontWeight="bold" color={colors.greenAccent[300]}>
              {pengurus_kabinet_gubernur_idTopengurus?.fullname || "-"}
            </Typography>
            <Typography fontSize={13} color={colors.gray[200]}>
              {pengurus_kabinet_wakil_idTopengurus?.fullname || "-"}
            </Typography>
          </Box>
        );
      },
      sortable: false,
    },
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<EditOutlined />}
            sx={{ minWidth: 70, fontWeight: 600, textTransform: "none" }}
            onClick={() => handleEditKabinet(params.row)}
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
            onClick={() => handleDeleteKabinet(params.row.id)}
            disabled={
              params.row.id === activeKabinetId || deletingId === params.row.id
            }
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
        mb={2}
      >
        <Header title="Kabinets" subtitle="Managing all existing kabinets" />
        {!showAddForm && (
          <Button
            variant="contained"
            color="secondary"
            sx={{
              bgcolor: colors.blueAccent[700],
              color: "#fff",
              fontWeight: 600,
              ":hover": { bgcolor: colors.blueAccent[800] },
            }}
            onClick={() => {
              setEditKabinet(null);
              setForm({
                name: "",
                visi: "",
                misi: ["", "", "", ""],
                logo: null,
                image: null,
                gubernur_id: "",
                wakil_id: "",
              });
              setLogoPreview(null);
              setImagePreview(null);
              setShowAddForm(true);
            }}
          >
            Add New Kabinet
          </Button>
        )}
      </Box>

      {showAddForm ? (
        <Box
          component="form"
          onSubmit={handleSaveKabinet}
          bgcolor={colors.primary[400]}
          p={4}
          borderRadius={2}
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          gap={4}
          minHeight="60vh"
          width="100%"
          alignItems="stretch"
        >
          {/* Left: Form Fields */}
          <Box flex={1} display="flex" flexDirection="column" gap={2}>
            <Typography variant="h5" fontWeight="bold" mb={1}>
              Add New Kabinet
            </Typography>
            <input
              name="name"
              placeholder="Kabinet Name"
              value={form.name}
              onChange={handleFormChange}
              required
              style={{
                padding: 10,
                borderRadius: 4,
                border: "1px solid #ccc",
                background: colors.primary[600],
                color: colors.gray[100],
              }}
            />
            <input
              name="visi"
              placeholder="Visi"
              value={form.visi}
              onChange={handleFormChange}
              required
              style={{
                padding: 10,
                borderRadius: 4,
                border: "1px solid #ccc",
                background: colors.primary[600],
                color: colors.gray[100],
              }}
            />
            <Box>
              <Typography fontWeight="bold" mb={1}>
                Misi
              </Typography>
              {form.misi.map((m, idx) => (
                <Box
                  key={idx}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={1}
                >
                  <input
                    value={m}
                    onChange={(e) => handleMisiChange(idx, e.target.value)}
                    placeholder={`Misi ${idx + 1}`}
                    required
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      background: colors.primary[600],
                      color: colors.gray[100],
                    }}
                  />
                  {form.misi.length > 1 && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => removeMisiField(idx)}
                      sx={{ minWidth: 36, px: 0 }}
                    >
                      -
                    </Button>
                  )}
                  {idx === form.misi.length - 1 && (
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      onClick={addMisiField}
                      sx={{ minWidth: 36, px: 0 }}
                    >
                      +
                    </Button>
                  )}
                </Box>
              ))}
            </Box>
            {/* Gubernur Dropdown */}
            <Autocomplete
              options={pengurusList}
              getOptionLabel={(option) => option.fullname}
              value={
                pengurusList.find((p) => p.id === form.gubernur_id) || null
              }
              onChange={(_, value) =>
                setForm((prev) => ({
                  ...prev,
                  gubernur_id: value ? value.id : "",
                }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Gubernur"
                  placeholder="Pilih Gubernur"
                  variant="outlined"
                  required
                  sx={{
                    input: {
                      background: colors.primary[600],
                      color: colors.gray[100],
                    },
                    label: { color: colors.gray[200] },
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth
            />
            {/* Wakil Dropdown */}
            <Autocomplete
              options={pengurusList}
              getOptionLabel={(option) => option.fullname}
              value={pengurusList.find((p) => p.id === form.wakil_id) || null}
              onChange={(_, value) =>
                setForm((prev) => ({
                  ...prev,
                  wakil_id: value ? value.id : "",
                }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Wakil Gubernur"
                  placeholder="Pilih Wakil Gubernur"
                  variant="outlined"
                  required
                  sx={{
                    input: {
                      background: colors.primary[600],
                      color: colors.gray[100],
                    },
                    label: { color: colors.gray[200] },
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth
            />
            <Box display="flex" gap={2} mt={2}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setShowAddForm(false)}
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
                {saving ? "Saving..." : editKabinet ? "Save Changes" : "Save"}
              </Button>
            </Box>
          </Box>

          {/* Right: Upload & Preview */}
          <Box
            flex={1}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="flex-start"
            gap={4}
            minWidth={260}
            maxWidth={400}
            bgcolor={colors.primary[500]}
            borderRadius={2}
            p={3}
          >
            <Typography fontWeight="bold" mb={1} color={colors.gray[100]}>
              Logo Preview
            </Typography>
            <Box
              width={120}
              height={130}
              display="flex"
              alignItems="center"
              justifyContent="center"
              border={`2px dashed ${colors.gray[300]}`}
              borderRadius="10%"
              overflow="hidden"
              mb={1}
              bgcolor={colors.primary[600]}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : editKabinet && editKabinet.logo_url ? (
                <img
                  src={`${editKabinet.logo_url}?cb=${Date.now()}`}
                  alt="Logo Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Typography color={colors.gray[300]} fontSize={14}>
                  No Logo
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              component="label"
              color="secondary"
              sx={{
                bgcolor: colors.blueAccent[700],
                color: "#fff",
                fontWeight: "bold",
                ":hover": { bgcolor: colors.blueAccent[800] },
              }}
              fullWidth
            >
              Upload Logo
              <input
                type="file"
                name="logo"
                accept="image/*"
                hidden
                onChange={handleFormChange}
              />
            </Button>

            <Typography fontWeight="bold" mb={1} color={colors.gray[100]}>
              Image Preview
            </Typography>
            <Box
              width={180}
              height={120}
              display="flex"
              alignItems="center"
              justifyContent="center"
              border={`2px dashed ${colors.gray[300]}`}
              borderRadius={2}
              overflow="hidden"
              mb={1}
              bgcolor={colors.primary[600]}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Image Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : editKabinet && editKabinet.image_url ? (
                <img
                  src={`${editKabinet.image_url}?cb=${Date.now()}`}
                  alt="Image Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Typography color={colors.gray[300]} fontSize={14}>
                  No Image
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              component="label"
              color="secondary"
              sx={{
                bgcolor: colors.blueAccent[700],
                color: "#fff",
                fontWeight: "bold",
                ":hover": { bgcolor: colors.blueAccent[800] },
              }}
              fullWidth
            >
              Upload Image
              <input
                type="file"
                name="image"
                accept="image/*"
                hidden
                onChange={handleFormChange}
              />
            </Button>
          </Box>
        </Box>
      ) : (
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
            rows={kabinets}
            columns={columns}
            loading={loading}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            autoHeight
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

export default Team;
