import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { database } from './firebaseConfig';
import { useRoute, useNavigation } from '@react-navigation/native';
import YouTube from 'react-native-youtube-iframe';

const CategoryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category } = route.params;
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]); 
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [durations, setDurations] = useState({}); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const playerRefs = useRef({}); 

  useEffect(() => {
    const videoRef = database.ref(`categories/${category}/videos`);

    videoRef.on('value', snapshot => {
      const videoData = snapshot.val();
      const videoList = [];

      for (let id in videoData) {
        videoList.push({
          id,
          url: videoData[id].url,
          title: videoData[id].title,
        });
      }

      setVideos(videoList);
      setFilteredVideos(videoList); // Initially, display all videos
    });

    return () => videoRef.off('value');
  }, [category]);

  useEffect(() => {
    // Filter videos based on search query
    const filtered = videos.filter(video => video.title.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredVideos(filtered);
  }, [searchQuery, videos]);

  const extractYouTubeID = (url) => {
    try {
      const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regExp);
      return match && match[1] ? match[1] : null;
    } catch (error) {
      console.error('Error extracting YouTube ID:', error);
      return null;
    }
  };

  const onVideoReady = (videoId) => async () => {
    try {
      const durationInSeconds = await playerRefs.current[videoId].getDuration();
      if (durationInSeconds) {
        setDurations((prev) => ({
          ...prev,
          [videoId]: formatDuration(durationInSeconds),
        }));
      }
    } catch (error) {
      console.error('Error fetching duration:', error);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVideoItem = ({ item }) => {
    const videoId = extractYouTubeID(item.url);
    const thumbnailUrl = videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : 'https://via.placeholder.com/120x80?text=No+Thumbnail';

    return (
      <TouchableOpacity
        style={styles.videoItem}
        onPress={() => setSelectedVideo(item.url)}
      >
        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2} ellipsizeMode="tail">
            {item.title}
          </Text>
          <Text style={styles.videoDuration}>
            {`Duration: ${durations[videoId] || 'Fetching...'}`}
          </Text>
        </View>
        <YouTube
          videoId={videoId}
          ref={(ref) => (playerRefs.current[videoId] = ref)}
          onReady={onVideoReady(videoId)}
          style={{ height: 0, width: 0 }} // Hidden player for fetching duration
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topLine} />
      <View style={styles.smallLine} />
      <View style={styles.textContainer}>
        <Text style={styles.text}>{category.toUpperCase()} Videos</Text>
      </View>
      <View style={styles.searchBarContainer}>
        <Image source={require('./assets/search.png')} style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search videos"
          placeholderTextColor="#001F54"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>
      {selectedVideo ? (
        <YouTube
          videoId={extractYouTubeID(selectedVideo)}
          play={true}
          height={300}
          width="100%"
        />
      ) : (
        <FlatList
          data={filteredVideos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    margin: 15,
    height: 40,
  },
  searchIcon: {
    width: 35,
    height: 35,
    marginRight: 10,
  },
  searchBar: {
    fontSize: 16,
    flex: 1,
    color: '#001F54', // Ensure text input color is visible
  },
  topLine: {
    position: 'absolute',
    left: 0,
    top: 20,
    width: '76%',
    height: 10,
    backgroundColor: '#001F54',
  },
  smallLine: {
    position: 'absolute',
    left: 0,
    top: 40,
    width: '55%',
    height: 10,
    backgroundColor: '#001F54',
  },
  textContainer: {
    marginTop: 60,
    marginLeft: 15,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 25,
  },
  videoItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    marginLeft: 15,
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  videoInfo: {
    flex: 1, // Ensures text stays within container
  },
  videoTitle: {
    fontSize: 18,
    color: '#333',
    flexWrap: 'wrap',
  },
  videoDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default CategoryScreen;
