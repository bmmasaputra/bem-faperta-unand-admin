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
  

  // Stats Modal state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    total_mahasiswa: "",
    total_pengurus: "",
    jumlah_proker: "",
  });

  // Hero Image Modal state
  const [openImageModal, setOpenImageModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");

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

        {/* Line Chart */}
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

        {/* Transaction Data */}
        <Box
          gridColumn={isXlDevices ? "span 4" : "span 3"}
          gridRow="span 2"
          bgcolor={colors.primary[400]}
          overflow="auto"
        >
          <Box borderBottom={`4px solid ${colors.primary[500]}`} p="15px">
            <Typography color={colors.gray[100]} variant="h5" fontWeight="600">
              Recent Transactions
            </Typography>
          </Box>

          {mockTransactions.map((transaction, index) => (
            <Box
              key={`${transaction.txId}-${index}`}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {transaction.txId}
                </Typography>
                <Typography color={colors.gray[100]}>
                  {transaction.user}
                </Typography>
              </Box>
              <Typography color={colors.gray[100]}>
                {transaction.date}
              </Typography>
              <Box
                bgcolor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                ${transaction.cost}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Revenue Details */}
        <Box
          gridColumn={isXlDevices ? "span 4" : "span 3"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Campaign
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <ProgressCircle size="125" />
            <Typography
              textAlign="center"
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
              $48,352 revenue generated
            </Typography>
            <Typography textAlign="center">
              Includes extra misc expenditures and costs
            </Typography>
          </Box>
        </Box>

        {/* Bar Chart */}
        <Box
          gridColumn={isXlDevices ? "span 4" : "span 3"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ p: "30px 30px 0 30px" }}
          >
            Sales Quantity
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="250px"
            mt="-20px"
          >
            <BarChart isDashboard={true} />
          </Box>
        </Box>

        {/* Geography Chart */}
        <Box
          gridColumn={isXlDevices ? "span 4" : "span 3"}
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="30px"
        >
          <Typography variant="h5" fontWeight="600" mb="15px">
            Geography Based Traffic
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="200px"
          >
            <GeographyChart isDashboard={true} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
