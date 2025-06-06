import {
  Box,
  useTheme,
  Button,
  Avatar,
  CircularProgress,
  Snackbar,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
} from "@mui/material";
import { Header } from "../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import {
  EditOutlined,
  DeleteOutline,
  AddCircleOutline,
  PersonAddAlt,
} from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";
import React, { useEffect, useState } from "react";

const URL = "https://bemfabe.vercel.app/api/v1";
const CONTACT_TYPES = ["Instagram", "LinkedIn", "Twitter", "Meta"];

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [pengurus, setPengurus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Edit/Add state
  const [showForm, setShowForm] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [editPengurus, setEditPengurus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: "",
    nim: "",
    fullname: "",
    jurusan: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Contact form state (for add/edit pengurus)
  const [contacts, setContacts] = useState([]);
  const [contactForm, setContactForm] = useState({
    link: "",
    contact_type: "",
  });
  const [addingContact, setAddingContact] = useState(false);
  const [deletingContactIdx, setDeletingContactIdx] = useState(null);

  // For edit mode only
  const [deletingContactId, setDeletingContactId] = useState(null);

  useEffect(() => {
    if (!showForm) {
      const fetchPengurus = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${URL}/pengurus`);
          const data = await res.json();
          setPengurus(data.data || []);
        } catch (err) {
          setPengurus([]);
          setSnackbar({
            open: true,
            message: "Failed to fetch pengurus data.",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchPengurus();
    }
  }, [showForm]);

  // Handle add new pengurus button
  const handleAddPengurus = () => {
    setIsAddMode(true);
    setEditPengurus(null);
    setForm({
      id: "",
      nim: "",
      fullname: "",
      jurusan: "",
      image: null,
    });
    setImagePreview(null);
    setContacts([]);
    setContactForm({ link: "", contact_type: "" });
    setShowForm(true);
  };

  // Handle edit button click
  const handleEditPengurus = (row) => {
    setIsAddMode(false);
    setEditPengurus(row);
    setForm({
      id: row.id,
      nim: row.nim,
      fullname: row.fullname,
      jurusan: row.jurusan,
      image: null,
    });
    setImagePreview(row.img_url || null);
    setContacts(row.pengurus_contact || []);
    setContactForm({ link: "", contact_type: "" });
    setShowForm(true);
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setForm((prev) => ({ ...prev, image: files[0] }));
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(files[0]);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // If user doesn't upload new image, fetch old image and send as file
  async function urlToFile(url, filename) {
    const res = await fetch(url);
    const blob = await res.blob();
    const ext = url.split(".").pop().split("?")[0];
    const mime = blob.type || (ext === "png" ? "image/png" : "image/jpeg");
    return new File([blob], filename, { type: mime });
  }

  // Handle save pengurus (edit)
  const handleSavePengurus = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    if (form.image) {
      formData.append("image", form.image);
    } else if (editPengurus && editPengurus.img_url) {
      const file = await urlToFile(editPengurus.img_url, "image.jpg");
      formData.append("image", file);
    }
    formData.append("id", form.id);
    formData.append("nim", form.nim);
    formData.append("fullname", form.fullname);
    formData.append("jurusan", form.jurusan);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/pengurus`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        setSnackbar({
          open: true,
          message: errData.message || "Failed to edit pengurus.",
          severity: "error",
        });
        setSaving(false);
        return;
      }
      setSnackbar({
        open: true,
        message: "Pengurus updated successfully!",
        severity: "success",
      });
      setShowForm(false);
      setEditPengurus(null);
      setForm({
        id: "",
        nim: "",
        fullname: "",
        jurusan: "",
        image: null,
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to edit pengurus.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle save new pengurus (add)
  const handleAddPengurusSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Validate minimal fields
    if (!form.nim || !form.fullname || !form.jurusan || !form.image) {
      setSnackbar({
        open: true,
        message: "Lengkapi semua data dan upload gambar.",
        severity: "error",
      });
      setSaving(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", form.image);
    formData.append("nim", form.nim);
    formData.append("fullname", form.fullname);
    formData.append("jurusan", form.jurusan);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/pengurus`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Failed to add pengurus.",
          severity: "error",
        });
        setSaving(false);
        return;
      }
      // Add contacts one by one
      let newContacts = [];
      for (const c of contacts) {
        const cres = await fetch(`${URL}/pengurus/contact`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pengurus_id: data.data.id,
            link: c.link,
            contact_type: c.contact_type,
          }),
        });
        const cdata = await cres.json();
        if (cres.ok && cdata.data) {
          newContacts.push(cdata.data);
        }
      }
      setSnackbar({
        open: true,
        message: "Pengurus & kontak berhasil ditambahkan!",
        severity: "success",
      });
      setShowForm(false);
      setForm({
        id: "",
        nim: "",
        fullname: "",
        jurusan: "",
        image: null,
      });
      setContacts([]);
      setImagePreview(null);
      // Refresh list
      setPengurus((prev) => [
        ...prev,
        { ...data.data, pengurus_contact: newContacts },
      ]);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to add pengurus.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle contact form change (for add/edit)
  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add contact to local state (for add/edit)
  const handleAddContact = (e) => {
    e.preventDefault();
    if (!contactForm.link || !contactForm.contact_type) {
      setSnackbar({
        open: true,
        message: "Isi tipe dan link kontak.",
        severity: "error",
      });
      return;
    }
    // Prevent duplicate contact type
    if (contacts.some((c) => c.contact_type === contactForm.contact_type)) {
      setSnackbar({
        open: true,
        message: "Tipe kontak sudah ada.",
        severity: "error",
      });
      return;
    }
    setContacts((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        link: contactForm.link,
        contact_type: contactForm.contact_type,
      },
    ]);
    setContactForm({ link: "", contact_type: "" });
  };

  // Remove contact from local state (for add)
  const handleRemoveContact = (idx) => {
    setContacts((prev) => prev.filter((_, i) => i !== idx));
  };

  // Remove contact from API (for edit)
  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact?"))
      return;
    setDeletingContactId(contactId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/pengurus/contact`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: contactId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Failed to delete contact.",
          severity: "error",
        });
        setDeletingContactId(null);
        return;
      }
      setSnackbar({
        open: true,
        message: "Contact deleted successfully!",
        severity: "success",
      });
      // Remove contact from editPengurus
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to delete contact.",
        severity: "error",
      });
    } finally {
      setDeletingContactId(null);
    }
  };

  // Handle delete pengurus
  const handleDeletePengurus = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pengurus?"))
      return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/pengurus`, {
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
          message: data.message || "Failed to delete pengurus.",
          severity: "error",
        });
        setDeletingId(null);
        return;
      }
      setSnackbar({
        open: true,
        message: "Pengurus deleted successfully!",
        severity: "success",
      });
      setPengurus((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to delete pengurus.",
        severity: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // DataGrid columns
  const columns = [
    {
      field: "nim",
      headerName: "NIM",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "fullname",
      headerName: "Fullname",
      flex: 1.5,
      minWidth: 180,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            src={params.row.img_url}
            alt={params.row.fullname}
            sx={{ width: 36, height: 36, mr: 1 }}
          />
          <span>{params.row.fullname}</span>
        </Box>
      ),
    },
    {
      field: "jurusan",
      headerName: "Jurusan",
      flex: 1,
      minWidth: 100,
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
            onClick={() => handleEditPengurus(params.row)}
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
            onClick={() => handleDeletePengurus(params.row.id)}
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
        <Header title="Pengurus" subtitle="List of Pengurus" />
        {!showForm && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PersonAddAlt />}
            sx={{
              bgcolor: colors.blueAccent[700],
              color: "#fff",
              fontWeight: 600,
              ":hover": { bgcolor: colors.blueAccent[800] },
            }}
            onClick={handleAddPengurus}
          >
            Add New Pengurus
          </Button>
        )}
      </Box>
      {showForm ? (
        <Box
          component="form"
          onSubmit={isAddMode ? handleAddPengurusSubmit : handleSavePengurus}
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
              {isAddMode ? "Add New Pengurus" : "Edit Pengurus"}
            </Typography>
            <input
              name="nim"
              placeholder="NIM"
              value={form.nim}
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
              name="fullname"
              placeholder="Fullname"
              value={form.fullname}
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
              name="jurusan"
              placeholder="Jurusan"
              value={form.jurusan}
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
            {/* Contact Info */}
            <Box mt={3}>
              <Typography fontWeight="bold" mb={1}>
                Kontak Pengurus
              </Typography>
              {contacts.length === 0 && (
                <Typography color={colors.gray[300]} fontSize={14}>
                  Pengurus ini belum memiliki kontak.
                </Typography>
              )}
              {contacts.map((contact, idx) => (
                <Box
                  key={contact.id}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={1}
                  sx={{
                    background: colors.primary[600],
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                  }}
                >
                  <Typography fontWeight="bold" sx={{ minWidth: 90 }}>
                    {contact.contact_type}
                  </Typography>
                  <Typography
                    sx={{
                      color: colors.blueAccent[200],
                      wordBreak: "break-all",
                      flex: 1,
                    }}
                  >
                    {contact.link}
                  </Typography>
                  {isAddMode ? (
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleRemoveContact(idx)}
                      disabled={deletingContactIdx === idx}
                    >
                      <DeleteOutline />
                    </IconButton>
                  ) : (
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDeleteContact(contact.id)}
                      disabled={deletingContactId === contact.id}
                    >
                      {deletingContactId === contact.id ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <DeleteOutline />
                      )}
                    </IconButton>
                  )}
                </Box>
              ))}
              {/* Add Contact Form */}
              <Box
                component="div"
                display="flex"
                alignItems="center"
                gap={1}
                mt={2}
              >
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="contact-type-label">Tipe</InputLabel>
                  <Select
                    labelId="contact-type-label"
                    name="contact_type"
                    label="Tipe"
                    value={contactForm.contact_type}
                    onChange={handleContactFormChange}
                  >
                    {CONTACT_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <input
                  name="link"
                  placeholder="Link"
                  value={contactForm.link}
                  onChange={handleContactFormChange}
                  style={{
                    padding: 8,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    background: colors.primary[600],
                    color: colors.gray[100],
                    flex: 1,
                  }}
                />
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<AddCircleOutline />}
                  disabled={addingContact}
                  sx={{ fontWeight: 600, minWidth: 80 }}
                  onClick={handleAddContact}
                >
                  {addingContact ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    "Tambah"
                  )}
                </Button>
              </Box>
            </Box>
            <Box display="flex" gap={2} mt={2}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setShowForm(false);
                  setIsAddMode(false);
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
              Image Preview
            </Typography>
            <Box
              width={180}
              height={180}
              display="flex"
              alignItems="center"
              justifyContent="center"
              border={`2px dashed ${colors.gray[300]}`}
              borderRadius={50}
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
            rows={pengurus}
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
            checkboxSelection
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

export default Contacts;
