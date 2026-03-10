import { MCQ } from '@/models/MCQ';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

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
      case 'Easy': return 'bg-[#10b981]';
      case 'Medium': return 'bg-[#f59e0b]';
      case 'Hard': return 'bg-[#ef4444]';
      default: return 'bg-[#64748b]';
    }
  };

  return (
    <View className="bg-card-light dark:bg-card-dark rounded-2xl p-5 mb-4 shadow-sm border border-border-light dark:border-border-dark">
      <View className="flex-row items-center justify-between mb-4">
        <View className={`px-2.5 py-1 rounded-lg ${getDifficultyColor(mcq.Difficulty)}`}>
          <Text className="text-white text-[12px] font-bold uppercase">{mcq.Difficulty}</Text>
        </View>
        <Text className="text-[12px] text-textSecondary-light dark:text-textSecondary-dark font-medium">
          {mcq.Reference?.Unit} • {mcq.Reference?.Chapter}
        </Text>
      </View>

      {isEditing ? (
        <View className="mb-4 gap-3">
          <TextInput
            className="bg-background-light dark:bg-background-dark border border-divider-light dark:border-divider-dark rounded-lg p-3 text-sm text-text-light dark:text-text-dark"
            value={editedQuestion}
            onChangeText={setEditedQuestion}
            multiline
            placeholder="Question"
          />
          {editedOptions.map((option, index) => (
            <View key={index} className="flex-row items-center gap-3">
              <TouchableOpacity
                className={`w-5 h-5 rounded-full border-2 border-[#cbd5e1] justify-center items-center ${editedAnswerIndex === index ? 'border-[#667eea]' : ''}`}
                onPress={() => setEditedAnswerIndex(index)}
              >
                {editedAnswerIndex === index && <View className="w-2.5 h-2.5 rounded-full bg-[#667eea]" />}
              </TouchableOpacity>
              <TextInput
                className="flex-1 bg-background-light dark:bg-background-dark border border-divider-light dark:border-divider-dark rounded-lg px-3 py-2 text-sm text-text-light dark:text-text-dark"
                value={option}
                onChangeText={(text) => handleOptionChange(index, text)}
                placeholder={`Option ${index + 1}`}
              />
            </View>
          ))}
          <View className="mt-2 gap-2">
            <Text className="text-[12px] font-bold text-textSecondary-light dark:text-textSecondary-dark uppercase tracking-wider">Explanation for Change</Text>
            <TextInput
              className="bg-background-light dark:bg-background-dark border border-divider-light dark:border-divider-dark rounded-lg p-3 text-sm text-text-light dark:text-text-dark min-h-[80px]"
              style={{ textAlignVertical: 'top' }}
              value={explanation}
              onChangeText={setExplanation}
              multiline
              placeholder="e.g., Corrected typo in option B, updated correct answer to C"
            />
          </View>
          <View className="flex-row justify-end gap-2.5 mt-2">
            <TouchableOpacity className="bg-[#667eea] px-4 py-2 rounded-lg" onPress={handleSave}>
              <Text className="text-white text-sm font-semibold">Save</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#94a3b8] px-4 py-2 rounded-lg" onPress={() => setIsEditing(false)}>
              <Text className="text-white text-sm font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="mb-5">
          <Text className="text-base font-semibold text-text-light dark:text-text-dark leading-6 mb-4">{mcq.Question}</Text>
          <View className="gap-2">
            {mcq.Options.map((option, index) => (
              <View key={index} className={`flex-row items-center p-3 bg-background-light dark:bg-background-dark rounded-xl border border-divider-light dark:border-divider-dark gap-3 ${index === mcq.AnswerIndex ? 'bg-[#f0fdf4] border-[#bcf0da]' : ''}`}>
                <View className={`w-6 h-6 rounded-full bg-[#e2e8f0] justify-center items-center ${index === mcq.AnswerIndex ? 'bg-[#10b981]' : ''}`}>
                  <Text className={`text-[12px] font-bold text-textSecondary-light dark:text-textSecondary-dark ${index === mcq.AnswerIndex ? 'text-white' : ''}`}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text className={`flex-1 text-sm text-textSecondary-light dark:text-textSecondary-dark font-medium ${index === mcq.AnswerIndex ? 'color-[#166534] font-semibold' : ''}`}>
                  {option}
                </Text>
                {index === mcq.AnswerIndex && (
                  <MaterialCommunityIcons name="check-circle" size={16} color="#10b981" />
                )}
              </View>
            ))}
          </View>
          {mcq.ChangeExplanation && (
            <View className="mt-4 p-3 bg-background-light dark:bg-background-dark rounded-xl flex-row gap-2 items-start">
              <MaterialCommunityIcons name="information-outline" size={16} color="#64748b" />
              <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark flex-1 leading-[18px]">
                <Text className="font-bold">Note: </Text>
                {mcq.ChangeExplanation}
              </Text>
            </View>
          )}
        </View>
      )}

      {!isEditing && (
        <View className="flex-row items-center justify-between pt-4 border-t border-border-light dark:border-border-dark">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-row items-center bg-[#10b981] py-2 px-4 rounded-lg gap-1.5"
              onPress={() => onApprove(mcq.mcqId!)}
            >
              <MaterialCommunityIcons name="check" size={18} color="#ffffff" />
              <Text className="text-white text-sm font-semibold">Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center bg-[#ef4444] py-2 px-4 rounded-lg gap-1.5"
              onPress={() => onReject(mcq.mcqId!)}
            >
              <MaterialCommunityIcons name="close" size={18} color="#ffffff" />
              <Text className="text-white text-sm font-semibold">Reject</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-background-light dark:bg-background-dark justify-center items-center"
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
