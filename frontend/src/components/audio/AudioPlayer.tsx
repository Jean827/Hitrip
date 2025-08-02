import React, { useState, useRef, useEffect } from 'react';
import { 
  Button, 
  Slider, 
  Space, 
  Typography, 
  Card, 
  Progress, 
  message,
  Select,
  Switch,
  Tooltip
} from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StopOutlined,
  DownloadOutlined,
  SoundOutlined,
  MutedOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

interface AudioTrack {
  id: string;
  title: string;
  description: string;
  language: 'zh' | 'en';
  url: string;
  duration: number; // 秒
  size: number; // MB
  isDownloaded: boolean;
}

interface AudioPlayerProps {
  tracks: AudioTrack[];
  onTrackChange?: (track: AudioTrack) => void;
  onDownload?: (track: AudioTrack) => void;
  autoPlay?: boolean;
  showControls?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  tracks,
  onTrackChange,
  onDownload,
  autoPlay = false,
  showControls = true
}) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'zh' | 'en'>('zh');
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化默认轨道
  useEffect(() => {
    if (tracks.length > 0 && !currentTrack) {
      const defaultTrack = tracks.find(track => track.language === selectedLanguage) || tracks[0];
      setCurrentTrack(defaultTrack);
    }
  }, [tracks, selectedLanguage, currentTrack]);

  // 语言切换
  useEffect(() => {
    if (tracks.length > 0) {
      const trackForLanguage = tracks.find(track => track.language === selectedLanguage);
      if (trackForLanguage && trackForLanguage !== currentTrack) {
        handleTrackChange(trackForLanguage);
      }
    }
  }, [selectedLanguage, tracks]);

  // 播放控制
  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      startProgressTracking();
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      stopProgressTracking();
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      stopProgressTracking();
    }
  };

  const handleTrackChange = (track: AudioTrack) => {
    if (isPlaying) {
      handlePause();
    }
    
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.duration);
    
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.load();
    }

    if (onTrackChange) {
      onTrackChange(track);
    }

    if (autoPlay) {
      setTimeout(() => {
        handlePlay();
      }, 100);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    stopProgressTracking();
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
    if (value === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const startProgressTracking = () => {
    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleDownload = async (track: AudioTrack) => {
    try {
      setIsLoading(true);
      
      // 模拟下载过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 在实际项目中，这里应该调用真实的下载API
      const link = document.createElement('a');
      link.href = track.url;
      link.download = `${track.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('下载完成');
      
      if (onDownload) {
        onDownload(track);
      }
    } catch (error) {
      message.error('下载失败');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const availableLanguages = [...new Set(tracks.map(track => track.language))];

  return (
    <div className="audio-player">
      <Card title="电子导游" extra={
        <Space>
          <Select
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            style={{ width: 100 }}
          >
            <Option value="zh">中文</Option>
            <Option value="en">English</Option>
          </Select>
          <Tooltip title="设置">
            <Button 
              icon={<SettingOutlined />} 
              onClick={() => setShowSettings(!showSettings)}
            />
          </Tooltip>
        </Space>
      }>
        <Space direction="vertical" className="w-full" size="middle">
          {/* 当前轨道信息 */}
          {currentTrack && (
            <div className="track-info">
              <Text strong>{currentTrack.title}</Text>
              <br />
              <Text type="secondary">{currentTrack.description}</Text>
              <div className="track-meta">
                <Space>
                  <Text type="secondary">时长: {formatTime(currentTrack.duration)}</Text>
                  <Text type="secondary">大小: {currentTrack.size}MB</Text>
                  <Text type="secondary">
                    {currentTrack.isDownloaded ? '已下载' : '在线播放'}
                  </Text>
                </Space>
              </div>
            </div>
          )}

          {/* 音频元素 */}
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onError={() => message.error('音频加载失败')}
          />

          {/* 播放控制 */}
          <div className="playback-controls">
            <Space>
              {isPlaying ? (
                <Button 
                  icon={<PauseCircleOutlined />} 
                  onClick={handlePause}
                  type="primary"
                  size="large"
                >
                  暂停
                </Button>
              ) : (
                <Button 
                  icon={<PlayCircleOutlined />} 
                  onClick={handlePlay}
                  type="primary"
                  size="large"
                >
                  播放
                </Button>
              )}
              <Button 
                icon={<StopOutlined />} 
                onClick={handleStop}
                size="large"
              >
                停止
              </Button>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={() => currentTrack && handleDownload(currentTrack)}
                loading={isLoading}
                size="large"
              >
                下载
              </Button>
            </Space>
          </div>

          {/* 进度条 */}
          <div className="progress-section">
            <div className="time-display">
              <Text>{formatTime(currentTime)}</Text>
              <Text>{formatTime(duration)}</Text>
            </div>
            <Slider
              value={currentTime}
              max={duration}
              onChange={handleSeek}
              tooltip={{ formatter: (value) => formatTime(value || 0) }}
            />
          </div>

          {/* 音量控制 */}
          <div className="volume-controls">
            <Space>
              <Button 
                icon={isMuted ? <MutedOutlined /> : <SoundOutlined />}
                onClick={handleMuteToggle}
              />
              <Slider
                value={isMuted ? 0 : volume}
                min={0}
                max={1}
                step={0.1}
                onChange={handleVolumeChange}
                style={{ width: 100 }}
              />
            </Space>
          </div>

          {/* 设置面板 */}
          {showSettings && (
            <Card size="small" title="播放设置">
              <Space direction="vertical" className="w-full">
                <div>
                  <Text>播放速度:</Text>
                  <Select
                    value={playbackRate}
                    onChange={handlePlaybackRateChange}
                    style={{ width: 120, marginLeft: 8 }}
                  >
                    <Option value={0.5}>0.5x</Option>
                    <Option value={0.75}>0.75x</Option>
                    <Option value={1}>1x</Option>
                    <Option value={1.25}>1.25x</Option>
                    <Option value={1.5}>1.5x</Option>
                    <Option value={2}>2x</Option>
                  </Select>
                </div>
                <div>
                  <Text>自动播放:</Text>
                  <Switch 
                    checked={autoPlay} 
                    style={{ marginLeft: 8 }}
                  />
                </div>
              </Space>
            </Card>
          )}

          {/* 轨道列表 */}
          <div className="track-list">
            <Text strong>可用轨道:</Text>
            <div className="tracks">
              {tracks
                .filter(track => track.language === selectedLanguage)
                .map(track => (
                  <Card 
                    key={track.id} 
                    size="small" 
                    className={`track-item ${currentTrack?.id === track.id ? 'selected' : ''}`}
                    onClick={() => handleTrackChange(track)}
                    style={{ cursor: 'pointer', marginTop: 8 }}
                  >
                    <div className="track-item-content">
                      <div className="track-item-info">
                        <Text strong>{track.title}</Text>
                        <br />
                        <Text type="secondary">{track.description}</Text>
                      </div>
                      <div className="track-item-actions">
                        <Space>
                          <Text type="secondary">{formatTime(track.duration)}</Text>
                          <Button 
                            size="small" 
                            icon={<DownloadOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(track);
                            }}
                          >
                            下载
                          </Button>
                        </Space>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default AudioPlayer; 