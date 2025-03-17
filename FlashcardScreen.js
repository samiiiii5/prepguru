import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, Dimensions, FlatList, 
  Animated, TouchableOpacity, ActivityIndicator, 
  Modal, TextInput 
} from 'react-native';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';  // Firebase Auth

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const SPACING = (width - CARD_WIDTH) / 4;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const FlashcardScreen = ({ route }) => {
  const { subject, chapter } = route.params;
  const userId = auth().currentUser?.uid;

  const [flashcards, setFlashcards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [addCardVisible, setAddCardVisible] = useState(false);
  const [newCardText, setNewCardText] = useState('');

  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!userId) return;

    const fetchFlashcards = async () => {
      try {
        const snapshot = await database()
          .ref(`flashcards/${userId}/${subject}/${chapter}`)
          .once('value');

        if (snapshot.exists()) {
          setFlashcards(Object.entries(snapshot.val() || {}).map(([key, value]) => ({ id: key, ...value })));
        }
      } catch (error) {
        console.error('Error fetching flashcards:', error);
      }
      setLoading(false);
    };

    fetchFlashcards();
  }, [userId, subject, chapter]);

  const handleSelectCard = (card) => setSelectedCard(card);

  const handleEditCard = () => {
    if (selectedCard) {
      setEditedText(selectedCard.text);
      setModalVisible(true);
    }
  };

  const handleSaveEdit = async () => {
    if (selectedCard && userId) {
      try {
        await database()
          .ref(`flashcards/${userId}/${subject}/${chapter}/${selectedCard.id}`)
          .update({ text: editedText });

        setFlashcards((current) => 
          current.map(card => card.id === selectedCard.id ? { ...card, text: editedText } : card)
        );
        setModalVisible(false);
        setSelectedCard(null);
      } catch (error) {
        console.error('Error saving flashcard:', error);
      }
    }
  };

  const handleDeleteCard = async () => {
    if (selectedCard && userId) {
      try {
        await database()
          .ref(`flashcards/${userId}/${subject}/${chapter}/${selectedCard.id}`)
          .remove();

        setFlashcards((current) => current.filter(card => card.id !== selectedCard.id));
        setSelectedCard(null);
      } catch (error) {
        console.error('Error deleting flashcard:', error);
      }
    }
  };

  const handleAddCard = async () => {
    if (userId) {
      try {
        const newCardRef = database().ref(`flashcards/${userId}/${subject}/${chapter}`).push();
        const newCard = { id: newCardRef.key, text: newCardText };
        await newCardRef.set(newCard);

        setFlashcards((current) => [...current, newCard]);
        setNewCardText('');
        setAddCardVisible(false);
      } catch (error) {
        console.error('Error adding flashcard:', error);
      }
    }
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp'
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp'
    });

    return (
      <TouchableOpacity onPress={() => handleSelectCard(item)}>
        <Animated.View style={[
          styles.card,
          selectedCard?.id === item.id && styles.selectedCard,
          { transform: [{ scale }], opacity }
        ]}>
          <Text style={styles.cardText}>{item.text}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{chapter}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#001F54" />
      ) : flashcards.length > 0 ? (
        <AnimatedFlatList
          data={flashcards}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          snapToAlignment="start"
          snapToInterval={CARD_WIDTH + 20}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />
      ) : (
        <Text style={styles.noCardsText}>No flashcards available</Text>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setAddCardVisible(true)}>
          <Text style={styles.actionButtonText}>Add Card</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, !selectedCard && { backgroundColor: 'gray' }]}
          onPress={handleEditCard}
          disabled={!selectedCard}
        >
          <Text style={styles.actionButtonText}>Edit Card</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, !selectedCard && { backgroundColor: 'gray' }]}
          onPress={handleDeleteCard}
          disabled={!selectedCard}
        >
          <Text style={styles.actionButtonText}>Delete Card</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalPopup}>
            <Text style={styles.modalTitle}>Edit Flashcard</Text>
            <TextInput style={styles.textInput} value={editedText} onChangeText={setEditedText} multiline />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleSaveEdit} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    backgroundColor: '#001F54',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  card: {
    width: CARD_WIDTH,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#EEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    height: 200,
    marginTop: 100,
  },
  cardText: { fontSize: 18, textAlign: 'center' },
  noCardsText: { fontSize: 18, color: 'gray', textAlign: 'center', marginTop: 50 },
  selectedCard: { borderWidth: 2, borderColor: '#001F54' },
  actionsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginTop: 10 
  },
  actionsContainer: { 
    flexDirection: 'column', 
    alignItems: 'center', 
    marginTop: 10,
    text: "#FFF"
  },
  actionButton: { 
    backgroundColor: '#001F54', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10, 
    width: '90%', 
    alignItems: 'center'
  },
  actionButtonText: { 
    color: '#FFF',        // White text
    fontWeight: 'bold', 
    textAlign: 'center', 
    fontSize: 20         // Bigger font size
  },
  
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalPopup: { 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 15, 
    width: '80%', 
    alignItems: 'center' 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  textInput: { 
    width: '100%', 
    minHeight: 50, 
    padding: 10, 
    fontSize: 16, 
    backgroundColor: '#F9F9F9', 
    marginBottom: 20, 
    borderRadius: 20 
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%' 
  },
  modalButton: { 
    flex: 1, 
    padding: 12, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginHorizontal: 5 
  },
  saveButton: { 
    backgroundColor: '#007BFF' 
  },
  saveButtonText: { 
    color: '#FFF', 
    fontWeight: 'bold' 
  },
  cancelButton: { 
    backgroundColor: '#FF3B30' 
  },
  cancelButtonText: { 
    color: '#FFF', 
    fontWeight: 'bold' 
  }
});

export default FlashcardScreen;