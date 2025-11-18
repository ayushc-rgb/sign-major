import { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';

const TextToSpeech = ({ text, language }) => {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!text) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language || 'en';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Tooltip title={speaking ? 'Stop' : 'Listen'}>
      <IconButton
        size="small"
        onClick={handleSpeak}
        color={speaking ? 'secondary' : 'default'}
      >
        {speaking ? <StopIcon /> : <VolumeUpIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default TextToSpeech;

