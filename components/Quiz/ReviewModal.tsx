import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { MCQ } from "../../models/MCQ";

export type QuizResult = {
  question: MCQ;
  selectedIndex: number;
  isCorrect: boolean;
  timeTaken: number;
};

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  quizId: string;
  results: QuizResult[];
  highestStreak: number;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  quizId,
  results,
  highestStreak,
}) => {
  const isDark = useColorScheme() === "dark";
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"summary" | "details">("summary");

  const selectedItem = results[selectedIndex];
  const score = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const accuracy = Math.round((score / total) * 100);
  const totalTime = results.reduce((acc, curr) => acc + curr.timeTaken, 0);
  const avgTime = total > 0 ? Math.round(totalTime / total) : 0;

  // Aggregate stats by topic/chapter
  const topicStats = results.reduce((acc, curr) => {
    const topic = curr.question.Reference?.Chapter || curr.question.Reference?.Unit || 'General';
    if (!acc[topic]) {
      acc[topic] = { correct: 0, total: 0 };
    }
    acc[topic].total += 1;
    if (curr.isCorrect) acc[topic].correct += 1;
    return acc;
  }, {} as Record<string, { correct: number, total: number }>);

  const chartData = Object.entries(topicStats).map(([topic, stats]) => {
    const topicAccuracy = Math.round((stats.correct / stats.total) * 100);
    return {
      value: topicAccuracy,
      label: topic.length > 8 ? topic.substring(0, 8) + '..' : topic,
      fullTopic: topic,
      frontColor: topicAccuracy >= 70 ? '#22c55e' : topicAccuracy <= 40 ? '#ef4444' : '#f59e0b',
    };
  });

  const strengths = Object.entries(topicStats)
    .filter(([_, stats]) => (stats.correct / stats.total) >= 0.7)
    .map(([topic]) => topic);

  const weaknesses = Object.entries(topicStats)
    .filter(([_, stats]) => (stats.correct / stats.total) < 0.5)
    .map(([topic]) => topic);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/60 p-4 md:p-6">
        <View className="bg-background-light dark:bg-background-dark rounded-[32px] p-6 md:p-8 w-full max-w-[800px] h-[90%] shadow-2xl">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-2xl font-bold text-text-light dark:text-text-dark">
                Quiz Review
              </Text>
              {/* <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                Quiz ID: {quizId}
              </Text> */}
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close-circle"
                size={40}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
            </TouchableOpacity>
          </View>

          {/* Stats Summary Bar */}
          <View className="flex-row justify-between bg-card-light dark:bg-card-dark p-4 rounded-2xl mb-4 border border-border-light dark:border-border-dark">
            <View className="items-center">
              <Text className="text-[8px] text-textSecondary-light dark:text-textSecondary-dark font-bold uppercase mb-0.5">Score</Text>
              <Text className="text-sm font-bold text-text-light dark:text-text-dark">{score}/{total}</Text>
            </View>
            <View className="items-center">
              <Text className="text-[8px] text-textSecondary-light dark:text-textSecondary-dark font-bold uppercase mb-0.5">Accuracy</Text>
              <Text className="text-sm font-bold text-text-light dark:text-text-dark">{accuracy}%</Text>
            </View>
            <View className="items-center">
              <Text className="text-[8px] text-textSecondary-light dark:text-textSecondary-dark font-bold uppercase mb-0.5">Streak</Text>
              <Text className="text-sm font-bold text-success">{highestStreak} 🔥</Text>
            </View>
            <View className="items-center">
              <Text className="text-[8px] text-textSecondary-light dark:text-textSecondary-dark font-bold uppercase mb-0.5">Avg Time</Text>
              <Text className="text-sm font-bold text-text-light dark:text-text-dark">{avgTime}s</Text>
            </View>
          </View>

          {/* View Toggle */}
          <View className="flex-row bg-card-light dark:bg-card-dark p-1 rounded-xl mb-6 border border-border-light dark:border-border-dark">
            <TouchableOpacity
              onPress={() => setViewMode("summary")}
              className={`flex-1 py-2 rounded-lg items-center ${viewMode === "summary" ? 'bg-primary shadow-sm' : ''}`}
            >
              <Text className={`font-bold text-xs ${viewMode === "summary" ? 'text-white' : 'text-textSecondary-light dark:text-textSecondary-dark'}`}>
                Summary
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode("details")}
              className={`flex-1 py-2 rounded-lg items-center ${viewMode === "details" ? 'bg-primary shadow-sm' : ''}`}
            >
              <Text className={`font-bold text-xs ${viewMode === "details" ? 'text-white' : 'text-textSecondary-light dark:text-textSecondary-dark'}`}>
                Question Review
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content Based on View Mode */}
          {viewMode === "summary" ? (
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {/* Performance Chart */}
              <View className="bg-card-light dark:bg-card-dark p-6 rounded-[24px] mb-6 border border-border-light dark:border-border-dark items-center">
                <Text className="text-sm font-bold text-text-light dark:text-text-dark mb-6 self-start">Accuracy by Topic</Text>
                <View className="ml-[-20]">
                  <BarChart
                    data={chartData}
                    barWidth={35}
                    noOfSections={4}
                    maxValue={100}
                    isAnimated
                    animationDuration={1000}
                    yAxisThickness={0}
                    xAxisThickness={0}
                    hideRules
                    yAxisTextStyle={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: 8, textAlign: 'center' }}
                    spacing={30}
                    initialSpacing={10}
                    barBorderTopLeftRadius={8}
                    barBorderTopRightRadius={8}
                    frontColor="#4F46E5"
                  />
                </View>
              </View>

              {/* Strengths & Weaknesses */}
              <View className="flex-row gap-4 mb-6">
                <View className="flex-1 bg-success/10 p-5 rounded-[24px] border border-success/20">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="trending-up" size={18} color="#22c55e" />
                    <Text className="ml-2 text-sm font-bold text-success">Strengths</Text>
                  </View>
                  {strengths.length > 0 ? strengths.slice(0, 3).map((s, i) => (
                    <Text key={i} className="text-[10px] text-success/80 mb-1.5 font-medium">• {s}</Text>
                  )) : (
                    <Text className="text-[10px] text-success/60 italic">Keep pushing!</Text>
                  )}
                </View>
                <View className="flex-1 bg-error/10 p-5 rounded-[24px] border border-error/20">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="trending-down" size={18} color="#ef4444" />
                    <Text className="ml-2 text-sm font-bold text-error">Weaknesses</Text>
                  </View>
                  {weaknesses.length > 0 ? weaknesses.slice(0, 3).map((w, i) => (
                    <Text key={i} className="text-[10px] text-error/80 mb-1.5 font-medium">• {w}</Text>
                  )) : (
                    <Text className="text-[10px] text-error/60 italic">No major weak spots!</Text>
                  )}
                </View>
              </View>

              {/* Recommendation Card */}
              <View className="bg-primary/5 p-6 rounded-[24px] border border-primary/20 mb-8">
                <Text className="text-sm font-bold text-primary mb-2">Focus Recommendation</Text>
                <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark leading-5 italic">
                  {weaknesses.length > 0
                    ? `Consider reviewing "${weaknesses[0]}" as it seems to be your primary challenge in this session.`
                    : "Excellent overall coverage! Try increasing the difficulty in your next session to keep growing."}
                </Text>
              </View>
            </ScrollView>
          ) : (
            <>
              {/* Question Navigator */}
              <View className="mb-6">
                <Text className="text-sm font-bold text-text-light dark:text-text-dark mb-3">Jump to Question</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                  {results.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedIndex(idx)}
                      className={`w-10 h-10 rounded-xl justify-center items-center mr-2 border-2 ${selectedIndex === idx
                        ? "border-primary"
                        : "border-transparent"
                        } ${item.isCorrect ? "bg-success/20" : "bg-error/20"
                        }`}
                    >
                      <Text className={`font-bold ${item.isCorrect ? "text-success" : "text-error"}`}>
                        {idx + 1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Selected Question Details */}
              {selectedItem && (
                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                  <View className="p-6 md:p-8 rounded-3xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
                    <View className="flex-row justify-between items-center mb-4">
                      <View className="flex-row items-center">
                        <View className={`px-2 py-0.5 rounded-md ${selectedItem.isCorrect ? 'bg-success/10' : 'bg-error/10'} mr-2`}>
                          <Text className={`text-[10px] font-bold uppercase ${selectedItem.isCorrect ? 'text-success' : 'text-error'}`}>
                            {selectedItem.isCorrect ? 'Correct' : 'Incorrect'}
                          </Text>
                        </View>
                        <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark">Question {selectedIndex + 1} {selectedItem.question.Reference?.Chapter ? `• ${selectedItem.question.Reference.Chapter}` : ''}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={14} color={isDark ? "#9ca3af" : "#6b7280"} />
                        <Text className="ml-1 text-xs text-textSecondary-light dark:text-textSecondary-dark">{selectedItem.timeTaken}s</Text>
                      </View>
                    </View>

                    <Text className="text-lg md:text-xl font-bold text-text-light dark:text-text-dark mb-6 leading-7 md:leading-8">
                      {selectedItem.question.Question}
                    </Text>

                    <View className="gap-2 md:gap-3">
                      {selectedItem.question.Options && selectedItem.question.Options.length > 0 ? (
                        selectedItem.question.Options.map((option, optIndex) => {
                          const isCorrect = optIndex === selectedItem.question.AnswerIndex;
                          const isSelected = optIndex === selectedItem.selectedIndex;
  
                          let optionClass =
                            "p-3 md:p-4 rounded-2xl flex-row justify-between items-center border-2";
                          let textClass = "text-sm md:text-base flex-1";
  
                          if (isCorrect) {
                            optionClass += " border-success bg-success/10";
                            textClass += " text-success font-bold";
                          } else if (isSelected) {
                            optionClass += " border-error bg-error/10";
                            textClass += " text-error font-bold";
                          } else {
                            optionClass += " border-border-light dark:border-border-dark";
                            textClass += " text-textSecondary-light dark:text-textSecondary-dark";
                          }
  
                          return (
                            <View key={optIndex} className={optionClass}>
                              <Text className={textClass}>{option}</Text>
                              {isCorrect && (
                                <Ionicons
                                  name="checkmark-circle"
                                  size={20}
                                  color="#22c55e"
                                />
                              )}
                              {isSelected && !isCorrect && (
                                <Ionicons name="close-circle" size={20} color="#ef4444" />
                              )}
                            </View>
                          );
                        })
                      ) : (
                        <View className="bg-card-light dark:bg-card-dark p-5 rounded-2xl border-2 border-border-light dark:border-border-dark flex-row items-center justify-between">
                           <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark flex-shrink mr-4">
                             Options and answer details were not recorded for this past attempt.
                           </Text>
                           <View className="flex-row items-center gap-1.5 flex-shrink-0">
                             <Ionicons 
                               name={selectedItem.isCorrect ? "checkmark-circle" : "close-circle"} 
                               color={selectedItem.isCorrect ? "#22c55e" : "#ef4444"} 
                               size={20} 
                             />
                             <Text className={`font-bold ${selectedItem.isCorrect ? 'text-success' : 'text-error'}`}>
                               {selectedItem.isCorrect ? 'Correct' : 'Incorrect'}
                             </Text>
                           </View>
                        </View>
                      )}
                    </View>
                  </View>
                </ScrollView>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ReviewModal;
