import {
  Box,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Modal,
  TextField,
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

  // Modal state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    total_mahasiswa: "",
    total_pengurus: "",
    jumlah_proker: "",
  });

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
    // Example: send PATCH request to update profile
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
        handleClose();
      } else {
        alert(result.message || "Failed to update stats");
      }
    } catch (err) {
      alert("Network error");
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
              <Button type="submit" variant="contained" color="primary">
                Save
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
                Revenue Generated
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                $59,342.32
              </Typography>
            </Box>
            <IconButton>
              <DownloadOutlined
                sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
              />
            </IconButton>
          </Box>
          <Box height="250px" mt="-20px">
            <LineChart isDashboard={true} />
          </Box>
        </Box>

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
