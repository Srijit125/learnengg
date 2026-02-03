import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MCQ } from '@/models/MCQ';
import { LinearGradient } from 'expo-linear-gradient';

interface MCQReviewCardProps {
  mcq: MCQ;
  onApprove: (mcqId: string) => void;
  onReject: (mcqId: string) => void;
  onUpdate: (mcqId: string, updatedMcq: Partial<MCQ>) => void;
}

const MCQReviewCard = ({ mcq, onApprove, onReject, onUpdate }: MCQReviewCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(mcq.Question);
  const [editedOptions, setEditedOptions] = useState([...mcq.Options]);
  const [editedAnswerIndex, setEditedAnswerIndex] = useState(mcq.AnswerIndex);
  const [explanation, setExplanation] = useState(mcq.ChangeExplanation || '');

  const handleSave = () => {
    onUpdate(mcq.mcqId!, { 
      Question: editedQuestion, 
      Options: editedOptions, 
      AnswerIndex: editedAnswerIndex,
      ChangeExplanation: explanation 
    });
    setIsEditing(false);
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...editedOptions];
    newOptions[index] = text;
    setEditedOptions(newOptions);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(mcq.Difficulty) }]}>
          <Text style={styles.difficultyText}>{mcq.Difficulty}</Text>
        </View>
        <Text style={styles.referenceText}>
          {mcq.Reference?.Unit} • {mcq.Reference?.Chapter}
        </Text>
      </View>

      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={editedQuestion}
            onChangeText={setEditedQuestion}
            multiline
            placeholder="Question"
          />
          {editedOptions.map((option, index) => (
            <View key={index} style={styles.optionEditRow}>
              <TouchableOpacity 
                style={[styles.radioMarker, editedAnswerIndex === index && styles.radioMarkerSelected]}
                onPress={() => setEditedAnswerIndex(index)}
              >
                {editedAnswerIndex === index && <View style={styles.radioInner} />}
              </TouchableOpacity>
              <TextInput
                style={[styles.input, styles.optionInput, { flex: 1 }]}
                value={option}
                onChangeText={(text) => handleOptionChange(index, text)}
                placeholder={`Option ${index + 1}`}
              />
            </View>
          ))}
          <View style={styles.explanationContainer}>
            <Text style={styles.label}>Explanation for Change</Text>
            <TextInput
              style={[styles.input, styles.explanationInput]}
              value={explanation}
              onChangeText={setExplanation}
              multiline
              placeholder="e.g., Corrected typo in option B, updated correct answer to C"
            />
          </View>
          <View style={styles.editActions}>
            <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => setIsEditing(false)}>
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.questionText}>{mcq.Question}</Text>
          <View style={styles.optionsList}>
            {mcq.Options.map((option, index) => (
              <View key={index} style={[styles.optionItem, index === mcq.AnswerIndex && styles.correctOption]}>
                <View style={[styles.optionIndicator, index === mcq.AnswerIndex && styles.correctIndicator]}>
                  <Text style={[styles.optionLabel, index === mcq.AnswerIndex && styles.correctLabelText]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[styles.optionText, index === mcq.AnswerIndex && styles.correctOptionText]}>
                  {option}
                </Text>
                {index === mcq.AnswerIndex && (
                  <MaterialCommunityIcons name="check-circle" size={16} color="#10b981" />
                )}
              </View>
            ))}
          </View>
          {mcq.ChangeExplanation && (
            <View style={styles.explanationDisplay}>
              <MaterialCommunityIcons name="information-outline" size={16} color="#64748b" />
              <Text style={styles.explanationDisplayText}>
                <Text style={{ fontWeight: '700' }}>Note: </Text>
                {mcq.ChangeExplanation}
              </Text>
            </View>
          )}
        </View>
      )}

      {!isEditing && (
        <View style={styles.footer}>
          <View style={styles.mainActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]} 
              onPress={() => onApprove(mcq.mcqId!)}
            >
              <MaterialCommunityIcons name="check" size={18} color="#ffffff" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]} 
              onPress={() => onReject(mcq.mcqId!)}
            >
              <MaterialCommunityIcons name="close" size={18} color="#ffffff" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => setIsEditing(true)}
          >
            <MaterialCommunityIcons name="pencil-outline" size={18} color="#64748b" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default MCQReviewCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  referenceText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  content: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 24,
    marginBottom: 16,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  correctOption: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bcf0da',
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctIndicator: {
    backgroundColor: '#10b981',
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  correctLabelText: {
    color: '#ffffff',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  correctOptionText: {
    color: '#166534',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  mainActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editContainer: {
    marginBottom: 16,
    gap: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
  },
  optionInput: {
    paddingVertical: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#667eea',
  },
  cancelButton: {
    backgroundColor: '#94a3b8',
  },
  optionEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioMarkerSelected: {
    borderColor: '#667eea',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#667eea',
  },
  explanationContainer: {
    marginTop: 8,
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  explanationInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  explanationDisplay: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  explanationDisplayText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
    lineHeight: 18,
  },
});
