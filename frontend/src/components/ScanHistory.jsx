import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Grid,
  Pagination,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { getHistory, deleteScan } from '../services/api';

const ScanHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, scanId: null });

  const fetchHistory = async (currentPage = 1) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getHistory(currentPage, 9);
      setHistory(data.items);
      setTotalPages(Math.ceil(data.total / data.page_size));
      setLoading(false);
    } catch (err) {
      setError('Failed to load history');
      setLoading(false);
      console.error('History fetch error:', err);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  const handleDelete = async () => {
    if (!deleteDialog.scanId) return;

    try {
      await deleteScan(deleteDialog.scanId);
      setDeleteDialog({ open: false, scanId: null });
      fetchHistory(page);
    } catch (err) {
      setError('Failed to delete scan');
      console.error('Delete error:', err);
    }
  };

  const openDeleteDialog = (scanId) => {
    setDeleteDialog({ open: true, scanId });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, scanId: null });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (history.length === 0) {
    return (
      <Alert severity="info">
        No scan history yet. Start scanning signs to build your history!
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {history.map((scan) => (
          <Grid item xs={12} sm={6} md={4} key={scan.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Chip
                    label={scan.detected_language.toUpperCase()}
                    size="small"
                    color="primary"
                  />
                  <IconButton
                    size="small"
                    onClick={() => openDeleteDialog(scan.id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '60px',
                  }}
                >
                  {scan.detected_text}
                </Typography>

                {scan.translated_text && (
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={`→ ${scan.target_language?.toUpperCase()}`}
                      size="small"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {scan.translated_text}
                    </Typography>
                  </Box>
                )}

                {scan.confidence_score && (
                  <Chip
                    label={`${(scan.confidence_score * 100).toFixed(0)}% confidence`}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                )}

                <Typography variant="caption" color="text.secondary" display="block">
                  {format(new Date(scan.created_at), 'PPpp')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Scan?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this scan? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScanHistory;

