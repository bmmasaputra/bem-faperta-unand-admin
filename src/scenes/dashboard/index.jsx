import {
  Box,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Modal,
  TextField,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Header,
  StatBox,
  LineChart,
  ProgressCircle,
  BarChart,
  GeographyChart,
} from "../../components";
import {
  DownloadOutlined,
  EditOutlined,
  Email,
  PersonAdd,
  PointOfSale,
  Traffic,
} from "@mui/icons-material";
import { tokens } from "../../theme";
import { mockTransactions } from "../../data/mockData";
import React, { useEffect, useState } from "react";

const URL = "https://bemfabe.vercel.app/api/v1";

function Dashboard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXlDevices = useMediaQuery("(min-width: 1260px)");
  const isMdDevices = useMediaQuery("(min-width: 724px)");
  const isXsDevices = useMediaQuery("(max-width: 436px)");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false); // universal modal loading
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openKabinetModal, setOpenKabinetModal] = useState(false);
  const [kabinetList, setKabinetList] = useState([]);
  const [selectedKabinet, setSelectedKabinet] = useState("");

  // Stats Modal states
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    total_mahasiswa: "",
    total_pengurus: "",
    jumlah_proker: "",
  });

  // Hero Image Modal states
  const [openImageModal, setOpenImageModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");

  // Gubernur and Wagub Image Modal states
  const [openGubModal, setOpenGubModal] = useState(false);
  const [openWagubModal, setOpenWagubModal] = useState(false);
  const [gubFile, setGubFile] = useState(null);
  const [wagubFile, setWagubFile] = useState(null);
  const [gubError, setGubError] = useState("");
  const [wagubError, setWagubError] = useState("");

  // Tambahkan state untuk modal sambutan
  const [openGubSambutanModal, setOpenGubSambutanModal] = useState(false);
  const [openWagubSambutanModal, setOpenWagubSambutanModal] = useState(false);
  const [gubSambutan, setGubSambutan] = useState("");
  const [wagubSambutan, setWagubSambutan] = useState("");
  const [gubSambutanError, setGubSambutanError] = useState("");
  const [wagubSambutanError, setWagubSambutanError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${URL}/profile`);
        const result = await response.json();
        setProfile(result.data);
      } catch (error) {
        console.error("Failed to fetch profile: ", error);
      }
    };

    fetchProfile();
  }, []);

  // Sync sambutan text from profile
  useEffect(() => {
    if (profile) {
      setGubSambutan(profile?.sambutan_gub ?? "");
      setWagubSambutan(profile?.sambutan_wagub ?? "");
    }
  }, [profile]);

  // Populate form when modal opens
  useEffect(() => {
    if (open && profile) {
      setForm({
        total_mahasiswa: profile.total_mahasiswa ?? "",
        total_pengurus: profile.total_pengurus ?? "",
        jumlah_proker: profile.jumlah_proker ?? "",
      });
    }
  }, [open, profile]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${URL}/profile/stats`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          total_mahasiswa: Number(form.total_mahasiswa),
          total_pengurus: Number(form.total_pengurus),
          jumlah_proker: Number(form.jumlah_proker),
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setProfile(result.data);
        setSnackbar({
          open: true,
          message: "Statistics updated successfully!",
          severity: "success",
        });
        handleClose();
      } else {
        setSnackbar({
          open: true,
          message: result.message || "Failed to update stats",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Network error", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenImageModal = () => {
    setImageError("");
    setImageFile(null);
    setOpenImageModal(true);
  };
  const handleCloseImageModal = () => {
    setOpenImageModal(false);
    setImageFile(null);
    setImageError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg"].includes(file.type)) {
      setImageError("File must be a JPG/JPEG image.");
      setImageFile(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("File size must be less than 2MB.");
      setImageFile(null);
      return;
    }
    setImageFile(file);
    setImageError("");
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setImageError("Please select a valid image.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("hero", imageFile);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${URL}/profile/hero`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Image uploaded successfully!",
          severity: "success",
        });
        handleCloseImageModal();
      } else {
        setImageError(result.message || "Failed to upload image.");
        setSnackbar({
          open: true,
          message: result.message || "Failed to upload image.",
          severity: "error",
        });
      }
    } catch (err) {
      setImageError("Network error.");
      setSnackbar({ open: true, message: "Network error.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenKabinetModal = async () => {
    setLoading(true);
    setOpenKabinetModal(true);
    try {
      const response = await fetch(`${URL}/kabinet`);
      const result = await response.json();
      setKabinetList(result.data || []);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to fetch kabinet list",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseKabinetModal = () => {
    setOpenKabinetModal(false);
    setSelectedKabinet("");
  };

  const handleChangeKabinet = async (e) => {
    setSelectedKabinet(e.target.value);
  };

  const handleSubmitKabinet = async (e) => {
    e.preventDefault();
    if (!selectedKabinet) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${URL}/profile/active`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ kabinet_aktif_id: selectedKabinet }),
      });
      const result = await response.json();
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Kabinet changed successfully!",
          severity: "success",
        });
        handleCloseKabinetModal();
      } else {
        setSnackbar({
          open: true,
          message: result.message || "Failed to change kabinet",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Network error", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk Gubernur
  const handleOpenGubModal = () => {
    setGubError("");
    setGubFile(null);
    setOpenGubModal(true);
  };
  const handleCloseGubModal = () => {
    setOpenGubModal(false);
    setGubFile(null);
    setGubError("");
  };
  const handleGubChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg"].includes(file.type)) {
      setGubError("File must be a JPG/JPEG image.");
      setGubFile(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setGubError("File size must be less than 2MB.");
      setGubFile(null);
      return;
    }
    setGubFile(file);
    setGubError("");
  };
  const handleGubSubmit = async (e) => {
    e.preventDefault();
    if (!gubFile) {
      setGubError("Please select a valid image.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("gub", gubFile);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${URL}/profile/gub`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Gubernur image uploaded successfully!",
          severity: "success",
        });
        handleCloseGubModal();
      } else {
        setGubError(result.message || "Failed to upload image.");
        setSnackbar({
          open: true,
          message: result.message || "Failed to upload image.",
          severity: "error",
        });
      }
    } catch (err) {
      setGubError("Network error.");
      setSnackbar({ open: true, message: "Network error.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk Wagub
  const handleOpenWagubModal = () => {
    setWagubError("");
    setWagubFile(null);
    setOpenWagubModal(true);
  };
  const handleCloseWagubModal = () => {
    setOpenWagubModal(false);
    setWagubFile(null);
    setWagubError("");
  };
  const handleWagubChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg"].includes(file.type)) {
      setWagubError("File must be a JPG/JPEG image.");
      setWagubFile(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setWagubError("File size must be less than 2MB.");
      setWagubFile(null);
      return;
    }
    setWagubFile(file);
    setWagubError("");
  };
  const handleWagubSubmit = async (e) => {
    e.preventDefault();
    if (!wagubFile) {
      setWagubError("Please select a valid image.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("wagub", wagubFile);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${URL}/profile/wagub`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Wagub image uploaded successfully!",
          severity: "success",
        });
        handleCloseWagubModal();
      } else {
        setWagubError(result.message || "Failed to upload image.");
        setSnackbar({
          open: true,
          message: result.message || "Failed to upload image.",
          severity: "error",
        });
      }
    } catch (err) {
      setWagubError("Network error.");
      setSnackbar({ open: true, message: "Network error.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handler for Gub Sambutan
  const handleOpenGubSambutanModal = () => {
    setGubSambutanError("");
    setOpenGubSambutanModal(true);
  };
  const handleCloseGubSambutanModal = () => {
    setOpenGubSambutanModal(false);
    setGubSambutanError("");
  };
  const handleGubSambutanChange = (e) => setGubSambutan(e.target.value);
  const handleGubSambutanSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${URL}/profile/sambutan`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sambutan_gub: gubSambutan,
          sambutan_wagub: wagubSambutan,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Gubernur sambutan updated!",
          severity: "success",
        });
        setProfile((prev) => ({ ...prev, gub_sambutan: gubSambutan }));
        handleCloseGubSambutanModal();
      } else {
        setGubSambutanError(result.message || "Failed to update sambutan.");
        setSnackbar({
          open: true,
          message: result.message || "Failed to update sambutan.",
          severity: "error",
        });
      }
    } catch {
      setGubSambutanError("Network error.");
      setSnackbar({ open: true, message: "Network error.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handler for Wagub Sambutan
  const handleOpenWagubSambutanModal = () => {
    setWagubSambutanError("");
    setOpenWagubSambutanModal(true);
  };
  const handleCloseWagubSambutanModal = () => {
    setOpenWagubSambutanModal(false);
    setWagubSambutanError("");
  };
  const handleWagubSambutanChange = (e) => setWagubSambutan(e.target.value);
  const handleWagubSambutanSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${URL}/profile/sambutan`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sambutan_gub: gubSambutan,
          sambutan_wagub: wagubSambutan,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Wagub sambutan updated!",
          severity: "success",
        });
        setProfile((prev) => ({ ...prev, wagub_sambutan: wagubSambutan }));
        handleCloseWagubSambutanModal();
      } else {
        setWagubSambutanError(result.message || "Failed to update sambutan.");
        setSnackbar({
          open: true,
          message: result.message || "Failed to update sambutan.",
          severity: "error",
        });
      }
    } catch {
      setWagubSambutanError("Network error.");
      setSnackbar({ open: true, message: "Network error.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
        {!isXsDevices && (
          <Box>
            <Button
              variant="contained"
              sx={{
                bgcolor: colors.blueAccent[700],
                color: "#fcfcfc",
                fontSize: isMdDevices ? "14px" : "10px",
                fontWeight: "bold",
                p: "10px 20px",
                mt: "18px",
                transition: ".3s ease",
                ":hover": {
                  bgcolor: colors.blueAccent[800],
                },
              }}
              startIcon={<DownloadOutlined />}
            >
              DOWNLOAD REPORTS
            </Button>
          </Box>
        )}
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns={
          isXlDevices
            ? "repeat(12, 1fr)"
            : isMdDevices
            ? "repeat(6, 1fr)"
            : "repeat(3, 1fr)"
        }
        gridAutoRows="140px"
        gap="20px"
      >
        {/* Statistic Items */}
        <Box
          gridColumn={
            isXlDevices ? "span 4" : isMdDevices ? "span 2" : "span 1"
          }
          bgcolor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          py={3}
        >
          {/* Two columns: Left (icon, stat, subtitle), Right (button) */}
          <Box
            display="flex"
            flexDirection="row"
            alignItems="stretch"
            width="100%"
            px={4}
            gap={2}
          >
            {/* Left: Icon, Stat, Subtitle (all left aligned, stacked vertically) */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="center"
              flex={1}
            >
              <PersonAdd
                sx={{ color: colors.greenAccent[600], fontSize: "32px" }}
              />
              <Typography
                variant="h4"
                fontWeight="bold"
                color={colors.gray[100]}
                sx={{ mt: 1 }}
              >
                {profile?.total_mahasiswa ?? 0}
              </Typography>
              <Typography variant="subtitle1" color={colors.gray[100]}>
                Jumlah Mahasiswa
              </Typography>
            </Box>
            {/* Right: Button (full height) */}
            <Box display="flex" alignItems="center">
              <Button
                variant="contained" // changed from "outlined" to "contained"
                size="small"
                onClick={handleOpen}
                sx={{
                  minWidth: 90,
                  height: "50%",
                  bgcolor: colors.blueAccent[700],
                  color: "#fcfcfc",
                  boxShadow: "none",
                  ":hover": {
                    bgcolor: colors.blueAccent[800],
                  },
                }}
              >
                Change
              </Button>
            </Box>
          </Box>
        </Box>

        <Box
          gridColumn={
            isXlDevices ? "span 4" : isMdDevices ? "span 2" : "span 1"
          }
          bgcolor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          py={3}
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="stretch"
            width="100%"
            px={4}
            gap={2}
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="center"
              flex={1}
            >
              <PointOfSale
                sx={{ color: colors.greenAccent[600], fontSize: "32px" }}
              />
              <Typography
                variant="h4"
                fontWeight="bold"
                color={colors.gray[100]}
                sx={{ mt: 1 }}
              >
                {profile?.total_pengurus ?? 0}
              </Typography>
              <Typography variant="subtitle1" color={colors.gray[100]}>
                Total Pengurus
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Button
                variant="contained" // changed from "outlined" to "contained"
                size="small"
                onClick={handleOpen}
                sx={{
                  minWidth: 90,
                  height: "50%",
                  bgcolor: colors.blueAccent[700],
                  color: "#fcfcfc",
                  boxShadow: "none",
                  ":hover": {
                    bgcolor: colors.blueAccent[800],
                  },
                }}
              >
                Change
              </Button>
            </Box>
          </Box>
        </Box>

        <Box
          gridColumn={
            isXlDevices ? "span 4" : isMdDevices ? "span 2" : "span 1"
          }
          bgcolor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          py={3}
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="stretch"
            width="100%"
            px={4}
            gap={2}
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="center"
              flex={1}
            >
              <Email
                sx={{ color: colors.greenAccent[600], fontSize: "32px" }}
              />
              <Typography
                variant="h4"
                fontWeight="bold"
                color={colors.gray[100]}
                sx={{ mt: 1 }}
              >
                {profile?.jumlah_proker ?? 0}
              </Typography>
              <Typography variant="subtitle1" color={colors.gray[100]}>
                Jumlah Proker
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Button
                variant="contained" // changed from "outlined" to "contained"
                size="small"
                onClick={handleOpen}
                sx={{
                  minWidth: 90,
                  height: "50%",
                  bgcolor: colors.blueAccent[700],
                  color: "#fcfcfc",
                  boxShadow: "none",
                  ":hover": {
                    bgcolor: colors.blueAccent[800],
                  },
                }}
              >
                Change
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Modal for editing stats */}
        <Modal open={open} onClose={handleClose}>
          <Box
            component="form"
            onSubmit={handleFormSubmit}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              minWidth: 300,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" mb={2}>
              Edit Statistics
            </Typography>
            <TextField
              label="Total Mahasiswa"
              name="total_mahasiswa"
              type="number"
              value={form.total_mahasiswa}
              onChange={handleFormChange}
              required
              fullWidth
            />
            <TextField
              label="Total Pengurus"
              name="total_pengurus"
              type="number"
              value={form.total_pengurus}
              onChange={handleFormChange}
              required
              fullWidth
            />
            <TextField
              label="Jumlah Proker"
              name="jumlah_proker"
              type="number"
              value={form.jumlah_proker}
              onChange={handleFormChange}
              required
              fullWidth
            />
            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button onClick={handleClose} color="secondary">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* ---------------- Row 2 ---------------- */}

        {/* Hero Image */}
        <Box
          gridColumn={
            isXlDevices ? "span 8" : isMdDevices ? "span 6" : "span 3"
          }
          gridRow="span 2"
          bgcolor={colors.primary[400]}
        >
          <Box
            mt="25px"
            px="30px"
            display="flex"
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.gray[100]}
              >
                Hero Image
              </Typography>
              {/* <Typography
                variant="h5"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                $59,342.32
              </Typography> */}
            </Box>
            <IconButton onClick={handleOpenImageModal}>
              <EditOutlined
                sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
              />
            </IconButton>
          </Box>
          <Box
            height="210px"
            mt="0px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            // sx={{ background: colors.primary[500], borderRadius: 2 }}
          >
            {profile?.hero_img_url ? (
              <img
                src={
                  profile?.hero_img_url
                    ? `${profile.hero_img_url}?t=${Date.now()}`
                    : ""
                }
                alt="Dashboard Visual"
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            ) : (
              <Typography color={colors.gray[200]}>
                No image available
              </Typography>
            )}
          </Box>
        </Box>

        {/* Modal for editing hero image */}
        <Modal open={openImageModal} onClose={handleCloseImageModal}>
          <Box
            component="form"
            onSubmit={handleImageSubmit}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              minWidth: 320,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" mb={1}>
              Update Hero Image
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Please upload a <b>landscape</b> JPG/JPEG image (max 2MB).
            </Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{
                color: colors.gray[100], // Make button text color same as font
                borderColor: colors.gray[100], // Optional: make border match text
                fontWeight: "bold",
                ":hover": {
                  borderColor: colors.gray[100],
                  background: colors.primary[600], // Optional: subtle hover effect
                },
                mb: 1,
              }}
            >
              Choose Image
              <input
                type="file"
                accept="image/jpeg,image/jpg"
                hidden
                onChange={handleImageChange}
              />
            </Button>
            {imageFile && (
              <Typography variant="body2" color="text.secondary">
                Selected: {imageFile.name}
              </Typography>
            )}
            {imageError && (
              <Typography color="error" variant="body2">
                {imageError}
              </Typography>
            )}
            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button onClick={handleCloseImageModal} color="secondary">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload"}
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Active Kabinet */}
        <Box
          gridColumn={isXlDevices ? "span 4" : "span 3"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="h5" fontWeight="600">
              Kabinet Aktif
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: colors.blueAccent[700],
                color: "#fcfcfc",
                fontWeight: "bold",
                minWidth: 90,
                ":hover": { bgcolor: colors.blueAccent[800] },
              }}
              onClick={handleOpenKabinetModal}
              disabled={loading}
            >
              Change
            </Button>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center">
            {profile?.kabinet?.logo_url ? (
              <img
                src={profile.kabinet.logo_url}
                alt="Kabinet Logo"
                style={{
                  maxHeight: "160px",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            ) : (
              <Typography color={colors.gray[200]}>
                No image available
              </Typography>
            )}
            <Typography
              variant="h4"
              fontWeight="600"
              textAlign="center"
              sx={{ mt: "10px" }}
            >
              {profile?.kabinet?.name
                ? "Kabinet " + profile.kabinet.name
                : "No active kabinet"}
            </Typography>
          </Box>
        </Box>

        {/* Modal for changing kabinet */}
        <Modal open={openKabinetModal} onClose={handleCloseKabinetModal}>
          <Box
            component="form"
            onSubmit={handleSubmitKabinet}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              minWidth: 320,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" mb={2}>
              Change Active Kabinet
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="kabinet-select-label">Kabinet</InputLabel>
              <Select
                labelId="kabinet-select-label"
                value={selectedKabinet}
                label="Kabinet"
                onChange={handleChangeKabinet}
                required
              >
                {kabinetList.map((kabinet) => (
                  <MenuItem key={kabinet.id} value={kabinet.id}>
                    {kabinet.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button
                onClick={handleCloseKabinetModal}
                color="secondary"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !selectedKabinet}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Gubernur Image */}
        <Box
          gridColumn={isXlDevices ? "span 4" : "span 3"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="20px"
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            <Typography variant="h5" fontWeight="600" mb="0">
              Gub Image
            </Typography>
            <IconButton onClick={handleOpenGubModal}>
              <EditOutlined
                sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
              />
            </IconButton>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="200px"
          >
            {profile?.gub_img_url ? (
              <img
                src={
                  profile?.gub_img_url
                    ? `${profile.gub_img_url}?t=${Date.now()}`
                    : ""
                }
                alt="Gubernur Image"
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            ) : (
              <Typography color={colors.gray[200]}>
                No image available
              </Typography>
            )}
          </Box>
        </Box>

        {/* Wagub Image */}
        <Box
          gridColumn={isXlDevices ? "span 4" : "span 3"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="20px"
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            <Typography variant="h5" fontWeight="600" mb="0">
              Wagub Image
            </Typography>
            <IconButton onClick={handleOpenWagubModal}>
              <EditOutlined
                sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
              />
            </IconButton>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="200px"
          >
            {profile?.wagub_img_url ? (
              <img
                src={
                  profile?.wagub_img_url
                    ? `${profile.wagub_img_url}?t=${Date.now()}`
                    : ""
                }
                alt="Gubernur Image"
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            ) : (
              <Typography color={colors.gray[200]}>
                No image available
              </Typography>
            )}
          </Box>
        </Box>

        {/* Modal for editing Gubernur Image */}
        <Modal open={openGubModal} onClose={handleCloseGubModal}>
          <Box
            component="form"
            onSubmit={handleGubSubmit}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              minWidth: 320,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" mb={1}>
              Update Gubernur Image
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Please upload a <b>transparent</b> JPG/JPEG image (max 2MB).
            </Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{
                color: colors.gray[100],
                borderColor: colors.gray[100],
                fontWeight: "bold",
                ":hover": {
                  borderColor: colors.gray[100],
                  background: colors.primary[600],
                },
                mb: 1,
              }}
            >
              Choose Image
              <input
                type="file"
                accept="image/jpeg,image/jpg"
                hidden
                onChange={handleGubChange}
              />
            </Button>
            {gubFile && (
              <Typography variant="body2" color="text.secondary">
                Selected: {gubFile.name}
              </Typography>
            )}
            {gubError && (
              <Typography color="error" variant="body2">
                {gubError}
              </Typography>
            )}
            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button
                onClick={handleCloseGubModal}
                color="secondary"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload"}
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Modal for editing Wagub image */}
        <Modal open={openWagubModal} onClose={handleCloseWagubModal}>
          <Box
            component="form"
            onSubmit={handleWagubSubmit}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              minWidth: 320,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" mb={1}>
              Update Wagub Image
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Please upload a <b>transparent</b> JPG/JPEG image (max 2MB).
            </Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{
                color: colors.gray[100],
                borderColor: colors.gray[100],
                fontWeight: "bold",
                ":hover": {
                  borderColor: colors.gray[100],
                  background: colors.primary[600],
                },
                mb: 1,
              }}
            >
              Choose Image
              <input
                type="file"
                accept="image/jpeg,image/jpg"
                hidden
                onChange={handleWagubChange}
              />
            </Button>
            {wagubFile && (
              <Typography variant="body2" color="text.secondary">
                Selected: {wagubFile.name}
              </Typography>
            )}
            {wagubError && (
              <Typography color="error" variant="body2">
                {wagubError}
              </Typography>
            )}
            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button
                onClick={handleCloseWagubModal}
                color="secondary"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload"}
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Sambutan */}
        <Box
          gridColumn={isXlDevices ? "span 4" : "span 3"}
          gridRow="span 2"
          bgcolor={colors.primary[400]}
          overflow="auto"
        >
          <Box borderBottom={`4px solid ${colors.primary[500]}`} p="15px">
            <Typography color={colors.gray[100]} variant="h5" fontWeight="600">
              Sambutan
            </Typography>
          </Box>

          {/* Gub Sambutan */}
          <Box borderBottom={`4px solid ${colors.primary[500]}`} p="15px">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                color={colors.greenAccent[500]}
                variant="h5"
                fontWeight="600"
              >
                Gubernur
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: colors.blueAccent[700],
                  color: "#fcfcfc",
                  fontWeight: "bold",
                  minWidth: 90,
                  ":hover": { bgcolor: colors.blueAccent[800] },
                }}
                onClick={handleOpenGubSambutanModal}
                disabled={loading}
              >
                Change
              </Button>
            </Box>
            <Typography
              color={colors.gray[100]}
              variant="body2"
              sx={{ mt: 1, whiteSpace: "pre-line" }}
            >
              {profile?.sambutan_gub || "-"}
            </Typography>
          </Box>

          {/* Modal for editing Gub Sambutan */}
          <Modal
            open={openGubSambutanModal}
            onClose={handleCloseGubSambutanModal}
          >
            <Box
              component="form"
              onSubmit={handleGubSambutanSubmit}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
                minWidth: 320,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography variant="h6" mb={2}>
                Edit Gubernur Sambutan
              </Typography>
              <TextField
                label="Sambutan"
                name="gub_sambutan"
                value={gubSambutan}
                onChange={handleGubSambutanChange}
                required
                fullWidth
                multiline
                minRows={4}
                error={!!gubSambutanError}
                helperText={gubSambutanError}
              />
              <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                <Button
                  onClick={handleCloseGubSambutanModal}
                  color="secondary"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </Box>
            </Box>
          </Modal>

          {/* Wagub Sambutan */}
          <Box borderBottom={`4px solid ${colors.primary[500]}`} p="15px">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                color={colors.greenAccent[500]}
                variant="h5"
                fontWeight="600"
              >
                Wakil Gubernur
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: colors.blueAccent[700],
                  color: "#fcfcfc",
                  fontWeight: "bold",
                  minWidth: 90,
                  ":hover": { bgcolor: colors.blueAccent[800] },
                }}
                onClick={handleOpenWagubSambutanModal}
                disabled={loading}
              >
                Change
              </Button>
            </Box>
            <Typography
              color={colors.gray[100]}
              variant="body2"
              sx={{ mt: 1, whiteSpace: "pre-line" }}
            >
              {profile?.sambutan_wagub || "-"}
            </Typography>
          </Box>

          {/* Modal for editing Wagub Sambutan */}
          <Modal
            open={openWagubSambutanModal}
            onClose={handleCloseWagubSambutanModal}
          >
            <Box
              component="form"
              onSubmit={handleWagubSambutanSubmit}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
                minWidth: 320,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography variant="h6" mb={2}>
                Edit Wagub Sambutan
              </Typography>
              <TextField
                label="Sambutan"
                name="wagub_sambutan"
                value={wagubSambutan}
                onChange={handleWagubSambutanChange}
                required
                fullWidth
                multiline
                minRows={4}
                error={!!wagubSambutanError}
                helperText={wagubSambutanError}
              />
              <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                <Button
                  onClick={handleCloseWagubSambutanModal}
                  color="secondary"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </Box>
            </Box>
          </Modal>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
