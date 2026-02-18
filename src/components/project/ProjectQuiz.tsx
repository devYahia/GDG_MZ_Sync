"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle2, XCircle, Award, RefreshCw, ArrowRight } from "lucide-react"

interface QuizQuestion {
    question: string
    options: string[]
    correct_option_index: number
    explanation: string
}

interface ProjectQuizProps {
    quiz: QuizQuestion[]
}

export function ProjectQuiz({ quiz }: ProjectQuizProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [showExplanation, setShowExplanation] = useState(false)
    const [score, setScore] = useState(0)
    const [isFinished, setIsFinished] = useState(false)

    if (!quiz || quiz.length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-8 text-center text-white/50">
                <p>No quiz available for this project.</p>
            </div>
        )
    }

    const currentQuestion = quiz[currentIndex]

    const handleOptionSelect = (index: number) => {
        if (selectedOption !== null) return // Prevent changing answer
        setSelectedOption(index)
        setShowExplanation(true)
        if (index === currentQuestion.correct_option_index) {
            setScore(prev => prev + 1)
        }
    }

    const handleNext = () => {
        if (currentIndex < quiz.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setSelectedOption(null)
            setShowExplanation(false)
        } else {
            setIsFinished(true)
        }
    }

    const handleRetry = () => {
        setCurrentIndex(0)
        setSelectedOption(null)
        setShowExplanation(false)
        setScore(0)
        setIsFinished(false)
    }

    if (isFinished) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-8 bg-black p-8 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                >
                    <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-3xl" />
                    <Award className="relative h-24 w-24 text-purple-400" />
                </motion.div>

                <div className="space-y-2 z-10">
                    <h2 className="text-3xl font-bold text-white">Quiz Completed!</h2>
                    <p className="text-xl text-white/60">
                        You scored <span className="text-purple-400 font-bold">{score}</span> out of <span className="text-white">{quiz.length}</span>
                    </p>
                </div>

                <button
                    onClick={handleRetry}
                    className="z-10 mt-8 flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-medium text-white transition-colors hover:bg-white/20"
                >
                    <RefreshCw className="h-4 w-4" />
                    Retry Quiz
                </button>
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col bg-black p-6 md:p-10 max-w-3xl mx-auto">
            <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/40 uppercase tracking-wider">
                        Question {currentIndex + 1} of {quiz.length}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-white/60">
                        {score}
                    </span>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white leading-relaxed">
                        {currentQuestion.question}
                    </h2>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => {
                            const isSelected = selectedOption === idx
                            const isCorrect = idx === currentQuestion.correct_option_index
                            const showResult = selectedOption !== null

                            let styles = "border-white/10 bg-white/5 hover:bg-white/10"
                            if (showResult) {
                                if (isCorrect) styles = "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
                                else if (isSelected) styles = "border-red-500/50 bg-red-500/10 text-red-100"
                                else styles = "border-transparent opacity-50"
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    disabled={selectedOption !== null}
                                    className={`relative flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${styles}`}
                                >
                                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${showResult && isCorrect ? "border-emerald-500 bg-emerald-500 text-black" :
                                            showResult && isSelected ? "border-red-500 bg-red-500 text-white" :
                                                "border-white/20"
                                        }`}>
                                        {showResult && isCorrect && <CheckCircle2 className="h-4 w-4" />}
                                        {showResult && isSelected && !isCorrect && <XCircle className="h-4 w-4" />}
                                    </div>
                                    <span className={showResult && (isCorrect || isSelected) ? "font-medium" : "text-white/80"}>
                                        {option}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Explanation & Next Button */}
                <AnimatePresence>
                    {showExplanation && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4"
                        >
                            <p className="text-sm text-blue-200">
                                <span className="font-bold">Explanation:</span> {currentQuestion.explanation}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleNext}
                        disabled={selectedOption === null}
                        className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 font-bold text-black transition-all hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {currentIndex === quiz.length - 1 ? "Finish" : "Next Question"}
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
