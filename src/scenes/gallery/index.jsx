import {
  Box,
  useTheme,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Header } from "../../components";
import { tokens } from "../../theme";
import { DeleteOutline, AddCircleOutline } from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";
import React, { useEffect, useState, useRef } from "react";

const URL = "https://bemfabe.vercel.app/api/v1";
const ALBUM_ID = "UIGcgfh8Nl7FpKFWhRkso"; // Change this to your album id
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const Gallery = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Add photo dialog
  const [openAdd, setOpenAdd] = useState(false);
  const [addFile, setAddFile] = useState(null);
  const [addFilePreview, setAddFilePreview] = useState("");
  const fileInputRef = useRef();

  // Fetch photos
  useEffect(() => {
    setLoading(true);
    fetch(`${URL}/album/${ALBUM_ID}`)
      .then((res) => res.json())
      .then((data) => {
        setPhotos(data.data?.album_images || []);
      })
      .catch(() => {
        setPhotos([]);
        setSnackbar({
          open: true,
          message: "Failed to fetch gallery.",
          severity: "error",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  // Reset preview when dialog closed
  useEffect(() => {
    if (!openAdd) {
      setAddFile(null);
      setAddFilePreview("");
    }
  }, [openAdd]);

  // Handle file input change to set preview
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setAddFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAddFilePreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setAddFilePreview("");
    }
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!addFile) {
      setSnackbar({
        open: true,
        message: "Please select an image file.",
        severity: "error",
      });
      return;
    }
    if (addFile.size > MAX_FILE_SIZE) {
      setSnackbar({
        open: true,
        message: "File size must be less than 5MB.",
        severity: "error",
      });
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", addFile, addFile.name);
      formData.append("name", "---");
      formData.append("desc", "---");
      formData.append("album_id", ALBUM_ID);

      const res = await fetch(`${URL}/album/photo`, {
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
          message: data.message || "Failed to add photo.",
          severity: "error",
        });
        setSaving(false);
        return;
      }
      // Refresh photo list
      fetch(`${URL}/album/${ALBUM_ID}`)
        .then((res) => res.json())
        .then((data) => {
          setPhotos(data.data?.album_images || []);
        });
      setSnackbar({
        open: true,
        message: "Photo added successfully!",
        severity: "success",
      });
      setOpenAdd(false);
      setAddFile(null);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to add photo.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle delete photo
  const handleDeletePhoto = async (id) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/album/image`, {
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
          message: data.message || "Failed to delete photo.",
          severity: "error",
        });
        setDeletingId(null);
        return;
      }
      setPhotos((prev) => prev.filter((p) => p.images.id !== id));
      setSnackbar({
        open: true,
        message: "Photo deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Failed to delete photo.",
        severity: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Masonry grid columns
  const getColumns = (photos, columns = 4) => {
    // Distribute photos into columns for masonry effect
    const cols = Array.from({ length: columns }, () => []);
    photos.forEach((photo, idx) => {
      cols[idx % columns].push(photo);
    });
    return cols;
  };

  // Responsive columns
  const getColumnCount = () => {
    if (window.innerWidth < 600) return 1;
    if (window.innerWidth < 900) return 2;
    if (window.innerWidth < 1200) return 3;
    return 4;
  };

  const [columnCount, setColumnCount] = useState(getColumnCount());

  useEffect(() => {
    const handleResize = () => setColumnCount(getColumnCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Render
  return (
    <Box m="20px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Header title="Gallery" subtitle="Photo Gallery" />
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
          onClick={() => setOpenAdd(true)}
        >
          Add Photo
        </Button>
      </Box>

      {loading ? (
        <Box
          m={3}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="50vh"
          width={"calc(100% - 40px)"}
        >
          <CircularProgress size={48} thickness={4} color="primary" />
          <Typography mt={2} color="text.secondary">
            Loading photos...
          </Typography>
        </Box>
      ) : photos.length === 0 ? (
        <Typography color="text.secondary">
          No photos in this gallery yet.
        </Typography>
      ) : (
        <Box
          display="flex"
          gap={2}
          alignItems="flex-start"
          width="100%"
          sx={{ overflowX: "auto" }}
        >
          {getColumns(photos, columnCount).map((col, colIdx) => (
            <Box
              key={colIdx}
              flex={1}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              {col.map((photo) => (
                <Box
                  key={photo.images.id}
                  position="relative"
                  borderRadius={2}
                  overflow="hidden"
                  boxShadow={2}
                  bgcolor={colors.primary[500]}
                  sx={{
                    transition: "box-shadow 0.2s",
                    "&:hover": { boxShadow: 6 },
                  }}
                >
                  {/* Delete button */}
                  <IconButton
                    size="small"
                    color="error"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 2,
                      bgcolor: "rgba(255,255,255,0.7)",
                      ":hover": { bgcolor: "rgba(255,255,255,1)" },
                    }}
                    onClick={() => handleDeletePhoto(photo.images.id)}
                    disabled={deletingId === photo.images.id}
                  >
                    {deletingId === photo.images.id ? (
                      <CircularProgress size={18} color="error" />
                    ) : (
                      <DeleteOutline />
                    )}
                  </IconButton>
                  {/* Image */}
                  <img
                    src={photo.images.img_url}
                    alt={photo.images.name}
                    style={{
                      width: "100%",
                      display: "block",
                      objectFit: "cover",
                      aspectRatio: "4/3",
                      background: "#eee",
                    }}
                  />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      )}

      {/* Add Photo Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add Photo</DialogTitle>
        <form onSubmit={handleAddPhoto}>
          <DialogContent>
            <Typography color="text.secondary" fontSize={14} mb={1}>
              File size must not be greater than 5MB.
            </Typography>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileInputChange}
            />
            <Button
              variant="contained"
              color="info"
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
              sx={{ fontWeight: 600, mb: 2 }}
              component="span"
              fullWidth
            >
              {addFile ? "Change Image" : "Select Image"}
            </Button>
            {addFile && (
              <>
                <Typography
                  fontSize={14}
                  color={colors.greenAccent[400]}
                  mb={2}
                >
                  {addFile.name} ({(addFile.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
                {addFilePreview && (
                  <Box
                    mb={2}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                  >
                    <img
                      src={addFilePreview}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 200,
                        borderRadius: 8,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        background: "#eee",
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdd(false)} color="secondary">
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
              {saving ? "Uploading..." : "Upload"}
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

export default Gallery;
