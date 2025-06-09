import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  useTheme,
  Snackbar,
} from "@mui/material";
import { Header } from "../../components";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useParams, useNavigate } from "react-router-dom";
import MuiAlert from "@mui/material/Alert";
import { tokens } from "../../theme";

const URL = "https://bemfabe.vercel.app/api/v1";

const ArticleEditor = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const { id } = useParams();
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const fileInputRef = useRef();
  const [editing, setEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (id === "new") {
      setForm({ title: "Judul", content: "Tulis isi artikel disini..." });
      setThumbnailFile(null);
      setThumbnailPreview("");
      setEditing(false);
      setLoading(false); // done loading immediately for new
    } else if (id) {
      setEditing(true);
      setLoading(true);
      const token = localStorage.getItem("token");
      fetch(`${URL}/article/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (data && data.data) {
            setForm({
              title: data.data.title || "",
              content: data.data.content || "",
            });
            setThumbnailPreview(data.data.thumbnail_url || "");
            setThumbnailFile(null);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Helper: fetch image URL and convert to File
  const urlToFile = async (url, filename = "thumbnail.jpg") => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setThumbnailPreview(ev.target.result);
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      if (editing) {
        if (thumbnailFile) {
          formData.append("thumbnail", thumbnailFile, thumbnailFile.name);
        } else if (thumbnailPreview) {
          const file = await urlToFile(thumbnailPreview, "thumbnail.jpg");
          formData.append("thumbnail", file, file.name);
        }
        formData.append("id", id);
      } else {
        if (thumbnailFile) {
          formData.append("thumbnail", thumbnailFile, thumbnailFile.name);
        }
      }

      formData.append("title", form.title);
      formData.append("content", form.content);

      let url = editing ? `${URL}/article/edit` : `${URL}/article/post`;
      let method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setSnackbar({
          open: true,
          message: data.message || "Failed to save article.",
          severity: "error",
        });
        setSaving(false);
        return;
      }
      setSnackbar({
        open: true,
        message: "Article saved successfully!",
        severity: "success",
      });
      setTimeout(() => {
        navigate("/article");
      }, 1200);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to save article.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        m={3}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="80vh"
        width={"calc(100% - 40px)"}
      >
        <CircularProgress size={48} thickness={4} color="inherit" />
        <Typography mt={2} color="text.secondary">
          Loading article...
        </Typography>
      </Box>
    );
  } 

  return (
    <Box m="20px">
      <Header title="Article Editor" />
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          value={form.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          required
          fullWidth
          sx={{
            mb: 2,
            background: colors.primary[600],
            input: { color: colors.gray[100] },
            label: { color: colors.gray[200] },
          }}
        />

        {/* Thumbnail Upload & Preview */}
        <Box mb={2}>
          <Typography fontWeight="bold" mb={1}>
            Thumbnail
          </Typography>
          <Box
            width={"100%"}
            height={"300px"}
            display="flex"
            alignItems="center"
            justifyContent="center"
            border={`2px dashed ${colors.gray[300]}`}
            borderRadius={2}
            overflow="hidden"
            mb={1}
            bgcolor={colors.primary[500]}
          >
            {thumbnailPreview ? (
              <img
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Typography color={colors.gray[300]} fontSize={14}>
                No Thumbnail
              </Typography>
            )}
          </Box>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleThumbnailChange}
          />
          <Button
            variant="contained"
            color="info"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            sx={{ fontWeight: 600, mt: 1 }}
            component="span"
          >
            {thumbnailPreview ? "Change Thumbnail" : "Upload Thumbnail"}
          </Button>
          {thumbnailFile && (
            <Typography fontSize={12} color={colors.greenAccent[400]} mt={1}>
              {thumbnailFile.name}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            mb: 3,
            background: colors.primary[600],
            borderRadius: 2,
            "& .ql-toolbar": {
              background: colors.primary[500],
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderColor: colors.gray[400],
              color: colors.gray[100],
            },
            "& .ql-container": {
              background: colors.primary[600],
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              borderColor: colors.gray[400],
              color: colors.gray[100],
              minHeight: 300,
            },
            "& .ql-editor": {
              color: colors.gray[100],
              minHeight: 250,
            },
            "& .ql-toolbar button": {
              color: colors.gray[100],
              borderColor: colors.gray[400],
            },
          }}
        >
          <ReactQuill
            theme="snow"
            value={form.content}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, content: value }))
            }
          />
        </Box>
        <Box display="flex" gap={2} mt={2}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/article")}
            fullWidth
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: colors.blueAccent[700],
              color: "#fff",
              fontWeight: 600,
              ":hover": { bgcolor: colors.blueAccent[800] },
            }}
            fullWidth
            disabled={saving}
            startIcon={
              saving ? <CircularProgress size={18} color="inherit" /> : null
            }
          >
            {saving ? "Saving..." : "Save Article"}
          </Button>
        </Box>
      </form>
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

export default ArticleEditor;
