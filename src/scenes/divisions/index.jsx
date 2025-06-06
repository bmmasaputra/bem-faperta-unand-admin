import {
  Box,
  useTheme,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Divider,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Header } from "../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import {
  EditOutlined,
  DeleteOutline,
  AddCircleOutline,
} from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";
import React, { useEffect, useState } from "react";

const URL = "https://bemfabe.vercel.app/api/v1";
const DIVISION_TYPES = ["Biro", "Dinas", "Lainnya"];

const Divisions = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [editDivision, setEditDivision] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [form, setForm] = useState({
    id: "",
    type: "",
    name_short: "",
    fullname: "",
    description: "",
  });

  // Pengurus management for division
  const [divisionPengurus, setDivisionPengurus] = useState([]);
  const [pengurusForm, setPengurusForm] = useState({
    pengurus_id: "",
    departemen: "",
    bidang: "",
  });
  const [addingPengurus, setAddingPengurus] = useState(false);
  const [deletingPengurusId, setDeletingPengurusId] = useState(null);

  // For pengurus dropdown
  const [allPengurus, setAllPengurus] = useState([]);

  // Fetch all divisions
  useEffect(() => {
    if (!showForm) {
      const fetchDivisions = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${URL}/division`);
          const data = await res.json();
          setDivisions(data.data || []);
        } catch (err) {
          setDivisions([]);
          setSnackbar({
            open: true,
            message: "Failed to fetch division data.",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchDivisions();
    }
  }, [showForm]);

  // Fetch all pengurus for dropdown
  useEffect(() => {
    if (showForm) {
      fetch(`${URL}/pengurus`)
        .then((res) => res.json())
        .then((data) => setAllPengurus(data.data || []))
        .catch(() => setAllPengurus([]));
    }
  }, [showForm]);

  // Fetch division detail (with pengurus) when editing
  useEffect(() => {
    if (showForm && !isAddMode && form.id) {
      const fetchDetail = async () => {
        try {
          const res = await fetch(`${URL}/division/${form.id}`);
          const data = await res.json();
          setDivisionPengurus(data.data?.division_pengurus || []);
        } catch {
          setDivisionPengurus([]);
        }
      };
      fetchDetail();
    } else if (isAddMode) {
      setDivisionPengurus([]);
    }
  }, [showForm, isAddMode, form.id]);

  // Handle add new division button
  const handleAddDivision = () => {
    setIsAddMode(true);
    setEditDivision(null);
    setForm({
      id: "",
      type: "",
      name_short: "",
      fullname: "",
      description: "",
    });
    setDivisionPengurus([]);
    setShowForm(true);
  };

  const handleEditDivision = async (row) => {
    setIsAddMode(false);
    setEditDivision(row);
    setLoading(true);
    try {
      const res = await fetch(`${URL}/division/${row.id}`);
      const data = await res.json();
      setForm({
        id: row.id,
        type: row.type,
        name_short: row.name_short,
        fullname: row.fullname,
        description: row.description,
      });
      setDivisionPengurus(data.data?.division_pengurus || []);
      setShowForm(true);
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to fetch division detail.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle save division (edit)
  const handleSaveDivision = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/division`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: form.id,
          type: form.type,
          name_short: form.name_short,
          fullname: form.fullname,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Failed to edit division.",
          severity: "error",
        });
        setSaving(false);
        return;
      }
      setSnackbar({
        open: true,
        message: "Division updated successfully!",
        severity: "success",
      });
      setShowForm(false);
      setEditDivision(null);
      setForm({
        id: "",
        type: "",
        name_short: "",
        fullname: "",
        description: "",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to edit division.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDivision = async (id) => {
    if (!window.confirm("Are you sure you want to delete this division?"))
      return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/division`, {
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
          message: data.message || "Failed to delete division.",
          severity: "error",
        });
        setDeletingId(null);
        return;
      }
      setSnackbar({
        open: true,
        message: "Division deleted successfully!",
        severity: "success",
      });
      setDivisions((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to delete division.",
        severity: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Handle save new division (add)
  const handleAddDivisionSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Validate minimal fields
    if (!form.type || !form.name_short || !form.fullname || !form.description) {
      setSnackbar({
        open: true,
        message: "Lengkapi semua data divisi.",
        severity: "error",
      });
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/division`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: form.type,
          name_short: form.name_short,
          fullname: form.fullname,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Failed to add division.",
          severity: "error",
        });
        setSaving(false);
        return;
      }
      // Add pengurus one by one
      let newPengurusList = [];
      for (const p of divisionPengurus) {
        const pengurusRes = await fetch(`${URL}/division/pengurus`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pengurus_id: p.pengurus_id,
            division_id: data.data.id,
            departemen: p.departemen,
            bidang: p.bidang,
          }),
        });
        const pengurusData = await pengurusRes.json();
        if (pengurusRes.ok && pengurusData.data) {
          newPengurusList.push(pengurusData.data);
        }
      }
      setSnackbar({
        open: true,
        message: "Division & pengurus berhasil ditambahkan!",
        severity: "success",
      });
      setShowForm(false);
      setForm({
        id: "",
        type: "",
        name_short: "",
        fullname: "",
        description: "",
      });
      setDivisionPengurus([]);
      // Refresh list
      setDivisions((prev) => [
        ...prev,
        { ...data.data, division_pengurus: newPengurusList },
      ]);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to add division.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Pengurus form change
  const handlePengurusFormChange = (e) => {
    const { name, value } = e.target;
    setPengurusForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPengurus = async (e) => {
    e.preventDefault && e.preventDefault();
    if (
      !pengurusForm.pengurus_id ||
      !pengurusForm.departemen ||
      !pengurusForm.bidang
    ) {
      setSnackbar({
        open: true,
        message: "Lengkapi semua data pengurus.",
        severity: "error",
      });
      return;
    }
    // Prevent duplicate pengurus
    if (
      divisionPengurus.some((p) => p.pengurus_id === pengurusForm.pengurus_id)
    ) {
      setSnackbar({
        open: true,
        message: "Pengurus sudah ada di divisi ini.",
        severity: "error",
      });
      return;
    }

    if (isAddMode) {
      // ADD MODE: just update state
      setDivisionPengurus((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          pengurus_id: pengurusForm.pengurus_id,
          departemen: pengurusForm.departemen,
          bidang: pengurusForm.bidang,
          fullname:
            allPengurus.find((p) => p.id === pengurusForm.pengurus_id)
              ?.fullname || "",
        },
      ]);
      setPengurusForm({ pengurus_id: "", departemen: "", bidang: "" });
    } else {
      // EDIT MODE: post to API
      setAddingPengurus(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${URL}/division/pengurus`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pengurus_id: pengurusForm.pengurus_id,
            division_id: form.id,
            departemen: pengurusForm.departemen,
            bidang: pengurusForm.bidang,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSnackbar({
            open: true,
            message: data.message || "Failed to add pengurus.",
            severity: "error",
          });
          setAddingPengurus(false);
          return;
        }
        setDivisionPengurus((prev) => [...prev, data.data]);
        setSnackbar({
          open: true,
          message: "Pengurus berhasil ditambahkan!",
          severity: "success",
        });
        setPengurusForm({ pengurus_id: "", departemen: "", bidang: "" });
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Network error. Failed to add pengurus.",
          severity: "error",
        });
      } finally {
        setAddingPengurus(false);
      }
    }
  };

  // Remove pengurus from local state (for add)
  const handleRemovePengurus = (idx) => {
    setDivisionPengurus((prev) => prev.filter((_, i) => i !== idx));
  };

  // Remove pengurus from API (for edit)
  const handleDeleteDivisionPengurus = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this pengurus from division?"
      )
    )
      return;
    setDeletingPengurusId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/division/pengurus`, {
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
          message: data.message || "Failed to delete pengurus from division.",
          severity: "error",
        });
        setDeletingPengurusId(null);
        return;
      }
      setSnackbar({
        open: true,
        message: "Pengurus removed from division!",
        severity: "success",
      });
      setDivisionPengurus((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to delete pengurus from division.",
        severity: "error",
      });
    } finally {
      setDeletingPengurusId(null);
    }
  };

  // DataGrid columns
  const columns = [
    {
      field: "no",
      headerName: "No",
      width: 60,
      valueGetter: (params) =>
        divisions.findIndex((d) => d.id === params.row.id) + 1,
      sortable: false,
      filterable: false,
    },
    {
      field: "type",
      headerName: "Type",
      width: 120,
    },
    {
      field: "name_short",
      headerName: "Acronym",
      width: 120,
    },
    {
      field: "fullname",
      headerName: "Full Name",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "action",
      headerName: "Action",
      width: 180,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<EditOutlined />}
            sx={{ minWidth: 70, fontWeight: 600, textTransform: "none" }}
            onClick={() => handleEditDivision(params.row)}
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
            onClick={() => handleDeleteDivision(params.row.id)}
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
        <Header title="Divisions" subtitle="List of Divisions" />
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
            onClick={handleAddDivision}
          >
            Add New Division
          </Button>
        )}
      </Box>
      {showForm ? (
        <Box
          component="form"
          onSubmit={isAddMode ? handleAddDivisionSubmit : handleSaveDivision}
          bgcolor={colors.primary[400]}
          p={4}
          borderRadius={2}
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          gap={4}
          maxWidth={1100}
          mx="auto"
        >
          {/* Left: Division Form */}
          <Box flex={1} display="flex" flexDirection="column" gap={2}>
            <Typography variant="h5" fontWeight="bold" mb={1}>
              {isAddMode ? "Add New Division" : "Edit Division"}
            </Typography>
            <TextField
              select
              label="Type"
              name="type"
              value={form.type}
              onChange={handleFormChange}
              required
              fullWidth
              sx={{ background: colors.primary[600] }}
            >
              {DIVISION_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Acronym"
              name="name_short"
              value={form.name_short}
              onChange={handleFormChange}
              required
              fullWidth
              sx={{ background: colors.primary[600] }}
            />
            <TextField
              label="Full Name"
              name="fullname"
              value={form.fullname}
              onChange={handleFormChange}
              required
              fullWidth
              sx={{ background: colors.primary[600] }}
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={(e) => {
                // Limit to 255 characters
                if (e.target.value.length <= 255) {
                  handleFormChange(e);
                }
              }}
              required
              multiline
              minRows={3}
              fullWidth
              sx={{ background: colors.primary[600] }}
              helperText={`${form.description.length}/255`}
            />
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
          {/* Right: Pengurus List */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 2, display: { xs: "none", md: "block" } }}
          />
          <Box flex={1.2} display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6" fontWeight="bold" mb={1}>
              Pengurus Division
            </Typography>
            {/* Add Pengurus Form */}
            <Box
              component="div"
              display="flex"
              alignItems="center"
              gap={1}
              mb={2}
            >
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="pengurus-label">Pengurus</InputLabel>
                <Select
                  labelId="pengurus-label"
                  name="pengurus_id"
                  label="Pengurus"
                  value={pengurusForm.pengurus_id}
                  onChange={handlePengurusFormChange}
                >
                  {allPengurus.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.fullname}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                name="departemen"
                placeholder="Departemen"
                value={pengurusForm.departemen}
                onChange={handlePengurusFormChange}
                size="small"
                sx={{ background: colors.primary[600] }}
              />
              <TextField
                name="bidang"
                placeholder="Bidang"
                value={pengurusForm.bidang}
                onChange={handlePengurusFormChange}
                size="small"
                sx={{ background: colors.primary[600] }}
              />
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<AddCircleOutline />}
                disabled={addingPengurus}
                sx={{ fontWeight: 600, minWidth: 80 }}
                onClick={handleAddPengurus}
              >
                {addingPengurus ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  "Tambah"
                )}
              </Button>
            </Box>
            {/* Pengurus List */}
            <Box
              sx={{
                maxHeight: 350,
                overflowY: "auto",
                background: colors.primary[600],
                borderRadius: 2,
                p: 2,
              }}
            >
              {divisionPengurus.length === 0 && (
                <Typography color={colors.gray[300]} fontSize={14}>
                  Belum ada pengurus di divisi ini.
                </Typography>
              )}
              {divisionPengurus.map((p, idx) => (
                <Box
                  key={p.id || p.pengurus_id}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={1}
                  sx={{
                    background: colors.primary[500],
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                  }}
                >
                  <Typography sx={{ minWidth: 30 }}>{idx + 1}.</Typography>
                  <Typography sx={{ minWidth: 120, fontWeight: 600 }}>
                    {p.fullname ||
                      p.pengurus?.fullname ||
                      allPengurus.find((x) => x.id === p.pengurus_id)
                        ?.fullname ||
                      "-"}
                  </Typography>
                  <Typography sx={{ minWidth: 90 }}>{p.departemen}</Typography>
                  <Typography sx={{ minWidth: 90 }}>{p.bidang}</Typography>
                  {isAddMode ? (
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleRemovePengurus(idx)}
                    >
                      <DeleteOutline />
                    </IconButton>
                  ) : (
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDeleteDivisionPengurus(p.id)}
                      disabled={deletingPengurusId === p.id}
                    >
                      {deletingPengurusId === p.id ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <DeleteOutline />
                      )}
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
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
            rows={divisions}
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

export default Divisions;
