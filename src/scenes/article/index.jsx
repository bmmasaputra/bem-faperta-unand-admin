import {
  Box,
  useTheme,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
  IconButton,
} from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import {
  EditOutlined,
  DeleteOutline,
  AddCircleOutline,
} from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const URL = "https://bemfabe.vercel.app/api/v1";

const Article = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${URL}/article`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setArticles(data.data || []);
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Failed to fetch articles.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const handleEdit = (row) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({
        open: true,
        message: "You must be logged in to edit articles.",
        severity: "error",
      });
      return;
    }
    navigate(`/editor/${row.id}`);
  };

  const handleAdd = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({
        open: true,
        message: "You must be logged in to add articles.",
        severity: "error",
      });
      return;
    }
    navigate(`/editor/new`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?"))
      return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/article/remove`, {
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
          message: data.message || "Failed to delete article.",
          severity: "error",
        });
        setDeletingId(null);
        return;
      }
      setSnackbar({
        open: true,
        message: "Article deleted successfully!",
        severity: "success",
      });
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to delete article.",
        severity: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      field: "no",
      headerName: "No",
      width: 70,
      valueGetter: (params) =>
        articles.findIndex((a) => a.id === params.row.id) + 1,
      sortable: false,
      filterable: false,
    },
    {
      field: "title",
      headerName: "Title",
      flex: 2,
      minWidth: 210,
      renderCell: (params) => (
        <Typography sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "created_at",
      headerName: "Created At",
      width: 180,
      valueFormatter: (params) =>
        new Date(params.value).toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
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
            onClick={() => handleEdit(params.row)}
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
            onClick={() => handleDelete(params.row.id)}
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

    return(
    <Box m="20px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Header title="Articles" subtitle="List of Articles" />
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
          onClick={handleAdd}
        >
          Add Article
        </Button>
      </Box>
      <Box
        mt={2}
        height="75vh"
        maxWidth="100%"
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.gray[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={articles}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          disableSelectionOnClick
          pageSize={10}
          rowsPerPageOptions={[10]}
          autoHeight
        />
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

export default Article;
