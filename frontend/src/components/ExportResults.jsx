import { Button, Menu, MenuItem } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useState } from 'react';

const ExportResults = ({ scanResult, translation, imageFile }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const exportAsJSON = () => {
    const data = {
      detected_text: scanResult.detected_text,
      detected_language: scanResult.detected_language,
      confidence_score: scanResult.confidence_score,
      translated_text: translation?.translated_text,
      target_language: translation?.target_language,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sign-vision-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    handleClose();
  };

  const exportAsText = () => {
    let content = '=== SIGN VISION - SCAN RESULT ===\n\n';
    content += `Date: ${new Date().toLocaleString()}\n\n`;
    content += `DETECTED TEXT:\n`;
    content += `Language: ${scanResult.detected_language.toUpperCase()}\n`;
    content += `Confidence: ${(scanResult.confidence_score * 100).toFixed(1)}%\n\n`;
    content += `${scanResult.detected_text}\n\n`;

    if (translation) {
      content += `TRANSLATION:\n`;
      content += `Language: ${translation.target_language.toUpperCase()}\n\n`;
      content += `${translation.translated_text}\n`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sign-vision-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    handleClose();
  };

  return (
    <>
      <Button
        startIcon={<DownloadIcon />}
        onClick={handleClick}
        variant="outlined"
      >
        Export
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={exportAsJSON}>Export as JSON</MenuItem>
        <MenuItem onClick={exportAsText}>Export as Text</MenuItem>
      </Menu>
    </>
  );
};

export default ExportResults;

