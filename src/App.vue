<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { HomeFilled, Document, ArrowLeft } from '@element-plus/icons-vue'

// 当前选中的页面
const currentPage = ref('home')
const previousPage = ref('home') // 保存之前的页面状态，用于恢复会话

// 指定格训练相关状态
const caseTrainingState = ref('select-case') // select-case, tutorial, practice
const selectedCase = ref<number | null>(null)

// 实战训练相关状态
type DeclensionType = 'append' | 'replace' | 'clear' | 'special'
type PluralCase1Type = 'append' | 'replace' | 'full' // 1格复数训练的三种情况
type Case2Type = 'append' | 'replace' | 'clear' | 'full' // 2格训练的四种情况
type Case3Type = 'append' | 'replace' | 'full' // 3格训练的三种情况
type Case4Type = 'append' | 'replace' | 'full' | 'nochange' // 4格训练的四种情况
type Case5Type = 'append' | 'replace' | 'full' // 5格训练的三种情况
type Case6Type = 'append' | 'replace' | 'full' // 6格训练的三种情况

interface PracticeSentence {
  id: number
  text: string
  targetWord: string
  originalEnding: string
  correctEnding: string
  possibleEndings: string[]
  explanation: string
  declensionType?: DeclensionType
  pluralCase1Type?: PluralCase1Type // 1格复数训练的类型
  case2Type?: Case2Type // 2格训练的类型
  case3Type?: Case3Type // 3格训练的类型
  case4Type?: Case4Type // 4格训练的类型
  case5Type?: Case5Type // 5格训练的类型
  case6Type?: Case6Type // 6格训练的类型
  correctFullWord?: string // 完整的正确单词（用于情况③）
}

const practiceSentence = ref<PracticeSentence>({
  id: 1,
  text: 'Я вижу <strong>стол</strong> в комнате.',
  targetWord: 'стол',
  originalEnding: '',
  correctEnding: '',
  possibleEndings: ['', 'а', 'у', 'ом', 'е'],
  explanation: '这是4格（宾格），阳性非动物名词不变位',
  declensionType: 'append'
})
const selectedEnding = ref<string>('')
const showDropdown = ref(false)
const answerResult = ref<'correct' | 'incorrect' | null>(null)
const showResult = ref(false)
const usedPracticeSentences = ref<number[]>([]) // 记录已经出现过的题目ID

const fullSentenceHtml = computed(() => {
  const sentence = practiceSentence.value
  let targetWordWithRedEnding = sentence.targetWord
  
  // 生成带标红的目标词（仅在未选择词尾时显示）
  if (!selectedEnding.value) {
    if (selectedCase.value === 1) {
      // 1格复数训练的标红逻辑
      if (sentence.pluralCase1Type === 'append' || sentence.pluralCase1Type === 'full') {
        // 情况①、③：不标红
        targetWordWithRedEnding = sentence.targetWord
      } else if (sentence.pluralCase1Type === 'replace' && sentence.originalEnding) {
        // 情况②：标红末尾字母
        if (sentence.targetWord.endsWith(sentence.originalEnding)) {
          const base = sentence.targetWord.slice(0, -sentence.originalEnding.length)
          targetWordWithRedEnding = `${base}<span class="red-ending">${sentence.originalEnding}</span>`
        }
      }
    } else if (selectedCase.value === 2) {
      // 2格训练的标红逻辑
      if (sentence.case2Type === 'replace' && sentence.originalEnding) {
        // 情况②：标红末尾字母
        if (sentence.targetWord.endsWith(sentence.originalEnding)) {
          const base = sentence.targetWord.slice(0, -sentence.originalEnding.length)
          targetWordWithRedEnding = `${base}<span class="red-ending">${sentence.originalEnding}</span>`
        }
      } else {
        // 情况①、③、④：不标红
        targetWordWithRedEnding = sentence.targetWord
      }
    } else if (selectedCase.value === 3) {
      // 3格训练的标红逻辑
      if (sentence.case3Type === 'replace' && sentence.originalEnding) {
        // 情况②：标红末尾字母
        if (sentence.targetWord.endsWith(sentence.originalEnding)) {
          const base = sentence.targetWord.slice(0, -sentence.originalEnding.length)
          targetWordWithRedEnding = `${base}<span class="red-ending">${sentence.originalEnding}</span>`
        }
      } else {
        // 情况①、③：不标红
        targetWordWithRedEnding = sentence.targetWord
      }
    } else if (selectedCase.value === 4) {
      // 4格训练的标红逻辑
      if (sentence.case4Type === 'replace' && sentence.originalEnding) {
        // 情况②：标红末尾字母
        if (sentence.targetWord.endsWith(sentence.originalEnding)) {
          const base = sentence.targetWord.slice(0, -sentence.originalEnding.length)
          targetWordWithRedEnding = `${base}<span class="red-ending">${sentence.originalEnding}</span>`
        }
      } else {
        // 情况①、③、④：不标红
        targetWordWithRedEnding = sentence.targetWord
      }
    } else if (selectedCase.value === 5) {
      // 5格训练的标红逻辑
      if (sentence.case5Type === 'replace' && sentence.originalEnding) {
        // 情况②：标红末尾字母
        if (sentence.targetWord.endsWith(sentence.originalEnding)) {
          const base = sentence.targetWord.slice(0, -sentence.originalEnding.length)
          targetWordWithRedEnding = `${base}<span class="red-ending">${sentence.originalEnding}</span>`
        }
      } else {
        // 情况①、③：不标红
        targetWordWithRedEnding = sentence.targetWord
      }
    } else if (selectedCase.value === 6) {
      // 6格训练的标红逻辑
      if (sentence.case6Type === 'replace' && sentence.originalEnding) {
        // 情况②：标红末尾字母
        if (sentence.targetWord.endsWith(sentence.originalEnding)) {
          const base = sentence.targetWord.slice(0, -sentence.originalEnding.length)
          targetWordWithRedEnding = `${base}<span class="red-ending">${sentence.originalEnding}</span>`
        }
      } else {
        // 情况①、③：不标红
        targetWordWithRedEnding = sentence.targetWord
      }
    }
  }
  
  let displayWord = ''
  
  // 处理已选择的词尾或完整词
  if (selectedEnding.value) {
    if (selectedCase.value === 1) {
      // 1格复数训练的显示逻辑
      if (sentence.pluralCase1Type === 'append') {
        // 情况①：直接添加词缀，词缀标红
        displayWord = `${sentence.targetWord}<span class="red-ending">${selectedEnding.value}</span>`
      } else if (sentence.pluralCase1Type === 'replace' && sentence.originalEnding) {
        // 情况②：替换末尾字母，替换后的词缀标红
        if (sentence.targetWord.endsWith(sentence.originalEnding)) {
          const base = sentence.targetWord.slice(0, -sentence.originalEnding.length)
          displayWord = `${base}<span class="red-ending">${selectedEnding.value}</span>`
        }
      } else if (sentence.pluralCase1Type === 'full') {
        // 情况③：显示完整的词，不标红
        displayWord = selectedEnding.value
      }
    } else if (selectedCase.value === 2) {
      // 2格训练的显示逻辑
      if (sentence.case2Type === 'append') {
        // 情况①：直接添加词缀，词缀标红
        displayWord = `${sentence.targetWord}<span class="red-ending">${selectedEnding.value}</span>`
      } else if (sentence.case2Type === 'replace' && sentence.originalEnding) {
        // 情况②：替换末尾字母，替换后的词缀标红
        if (sentence.targetWord.endsWith(sentence.originalEnding)) {
          const base = sentence.targetWord.slice(0, -sentence.originalEnding.length)
          displayWord = `${base}<span class="red-ending">${selectedEnding.value}</span>`
        }
      } else if (sentence.case2Type === 'clear' && sentence.originalEnding) {
        // 情况③：去除末尾字母
        if (sentence.targetWord.endsWith(sentence.originalEnding)) {
          displayWord = sentence.targetWord.slice(0, -sentence.originalEnding.length)
        }
      } else if (sentence.case2Type === 'full') {
        // 情况④：显示完整的词，不标红
        displayWord = selectedEnding.value
      }
    } else if (selectedCase.value === 3) {
      // 3格训练的显示逻辑
      if (sentence.case3Type === 'append') {
        // 情况①：直接添加词缀，词缀标红
        displayWord = `${sentence.targetWord}<span class="red-ending">${selectedEnding.value}</span>`
      } else if (sentence.case3Type === 'replace' && sentence.originalEnding) {
        // 情况②：替换末尾字母，替换后的词缀标红
        if (sentence.targetWord.endsWith(sentence.originalEnding)) {
          const base = sentence.targetWord.slice(0, -sentence.originalEnding.length)
          displayWord = `${base}<span class="red-ending">${selectedEnding.value}</span>`
        }
      } else if (sentence.case3Type === 'full') {
        // 情况③：显示完整的词，不标红
        displayWord = selectedEnding.value
      }
    } else if (selectedCase.value === 4) {
      // 4格训练的显示逻辑
      if (sentence.case4Type === 'append') {
        // 情况①：直接添加词缀，词缀标红
        displayWord = `${sentence.targetWord}<span class="red-ending">${selectedEnding.value}</span>`
      } else if (sentence.case4Type === 'replace' && sentence.originalEnding) {
        // 情况②：替换末尾字母，替换后的词缀标红
        if (sentence.targetWord.endsWith(sentence.originalEnding)) {
          const base = sentence.targetWord.slice(0, -sentence.originalEnding.length)
          displayWord = `${base}<span class="red-ending">${selectedEnding.value}</span>`
        }
      } else if (sentence.case4Type === 'full') {
        // 情况③：显示完整的词，不标红
        displayWord = selectedEnding.value
      } else if (sentence.case4Type === 'nochange') {
        // 情况④：不变化，保持原词
        displayWord = sentence.targetWord
      }
    } else if (selectedCase.value === 5) {
      // 5格训练的显示逻辑
      if (sentence.case5Type === 'append') {
        // 情况①：直接添加词缀，词缀标红
        displayWord = `${sentence.targetWord}<span class="red-ending">${selectedEnding.value}</span>`
      } else if (sentence.case5Type === 'replace' && sentence.originalEnding) {
        // 情况②：替换末尾字母，替换后的词缀标红
        if (sentence.targetWord.endsWith(sentence.originalEnding)) {
          const base = sentence.targetWord.slice(0, -sentence.originalEnding.length)
          displayWord = `${base}<span class="red-ending">${selectedEnding.value}</span>`
        }
      } else if (sentence.case5Type === 'full') {
        // 情况③：显示完整的词，不标红
        displayWord = selectedEnding.value
      }
    } else if (selectedCase.value === 6) {
      // 6格训练的显示逻辑
      if (sentence.case6Type === 'append') {
        // 情况①：直接添加词缀，词缀标红
        displayWord = `${sentence.targetWord}<span class="red-ending">${selectedEnding.value}</span>`
      } else if (sentence.case6Type === 'replace' && sentence.originalEnding) {
        // 情况②：替换末尾字母，替换后的词缀标红
        if (sentence.targetWord.endsWith(sentence.originalEnding)) {
          const base = sentence.targetWord.slice(0, -sentence.originalEnding.length)
          displayWord = `${base}<span class="red-ending">${selectedEnding.value}</span>`
        }
      } else if (sentence.case6Type === 'full') {
        // 情况③：显示完整的词，不标红
        displayWord = selectedEnding.value
      }
    } else {
      // 其他格的原有逻辑
      if (sentence.originalEnding && sentence.targetWord.endsWith(sentence.originalEnding)) {
        const base = sentence.targetWord.slice(0, -sentence.originalEnding.length)
        displayWord = `${base}<span class="red-ending">${selectedEnding.value}</span>`
      } else {
        displayWord = `${sentence.targetWord}<span class="red-ending">${selectedEnding.value}</span>`
      }
    }
  } else {
    // 未选择时显示原始标红
    displayWord = targetWordWithRedEnding
  }
  
  const wordHtml = `<strong class="clickable-target-word" style="color: #3498db; cursor: pointer;">${displayWord}</strong>`
  let result = sentence.text
  
  if (result.includes(`<strong>${sentence.targetWord}</strong>`)) {
    result = result.replace(`<strong>${sentence.targetWord}</strong>`, wordHtml)
  } else {
    result = result.replace(sentence.targetWord, wordHtml)
  }
  
  return result
})

const getSimpleCorrectAnswer = () => {
  const sentence = practiceSentence.value
  if (selectedCase.value === 1 && sentence.pluralCase1Type === 'full' && sentence.correctFullWord) {
    // 1格复数训练情况③：显示完整正确词
    return sentence.correctFullWord
  } else if (selectedCase.value === 1 && sentence.pluralCase1Type === 'append') {
    // 1格复数训练情况①：直接添加词缀
    return sentence.targetWord + sentence.correctEnding
  } else if (selectedCase.value === 2 && sentence.case2Type === 'full' && sentence.correctFullWord) {
    // 2格训练情况④：显示完整正确词
    return sentence.correctFullWord
  } else if (selectedCase.value === 3 && sentence.case3Type === 'full' && sentence.correctFullWord) {
    // 3格训练情况③：显示完整正确词
    return sentence.correctFullWord
  } else if (selectedCase.value === 4 && sentence.case4Type === 'full' && sentence.correctFullWord) {
    // 4格训练情况③：显示完整正确词
    return sentence.correctFullWord
  } else if (selectedCase.value === 4 && sentence.case4Type === 'nochange') {
    // 4格训练情况④：不变
    return sentence.targetWord
  } else if (selectedCase.value === 5 && sentence.case5Type === 'full' && sentence.correctFullWord) {
    // 5格训练情况③：显示完整正确词
    return sentence.correctFullWord
  } else if (selectedCase.value === 5 && sentence.case5Type === 'append') {
    // 5格训练情况①：直接添加词缀
    return sentence.targetWord + sentence.correctEnding
  } else if (selectedCase.value === 6 && sentence.case6Type === 'full' && sentence.correctFullWord) {
    // 6格训练情况③：显示完整正确词
    return sentence.correctFullWord
  } else if (selectedCase.value === 6 && sentence.case6Type === 'append') {
    // 6格训练情况①：直接添加词缀
    return sentence.targetWord + sentence.correctEnding
  } else if (selectedCase.value === 2 && sentence.case2Type === 'clear' && sentence.originalEnding) {
    // 2格训练情况③：去除末尾字母
    if (sentence.targetWord.endsWith(sentence.originalEnding)) {
      return sentence.targetWord.slice(0, -sentence.originalEnding.length)
    }
    return sentence.targetWord
  } else if (selectedCase.value === 2 && sentence.case2Type === 'append') {
    // 2格训练情况①：直接添加词缀
    return sentence.targetWord + sentence.correctEnding
  } else if (selectedCase.value === 3 && sentence.case3Type === 'append') {
    // 3格训练情况①：直接添加词缀
    return sentence.targetWord + sentence.correctEnding
  } else if (selectedCase.value === 4 && sentence.case4Type === 'append') {
    // 4格训练情况①：直接添加词缀
    return sentence.targetWord + sentence.correctEnding
  } else if (sentence.originalEnding && sentence.targetWord.endsWith(sentence.originalEnding)) {
    return sentence.targetWord.slice(0, -sentence.originalEnding.length) + sentence.correctEnding
  } else {
    return sentence.targetWord + sentence.correctEnding
  }
}

const dropdownTop = ref(0)
const dropdownLeft = ref(0)

const handleSentenceClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (target.classList.contains('clickable-target-word') || target.closest('.clickable-target-word')) {
    const clickableTarget = target.classList.contains('clickable-target-word') 
      ? target 
      : target.closest('.clickable-target-word') as HTMLElement
    showDropdown.value = !showDropdown.value
    if (showDropdown.value) {
      const rect = clickableTarget.getBoundingClientRect()
      dropdownTop.value = rect.bottom + 5
      dropdownLeft.value = rect.left
    }
  }
}

// 测试模式相关状态
const testState = ref('ongoing') // ongoing, completed
const currentQuestionIndex = ref(0)
const testQuestions = ref<any[]>([])
const userAnswers = ref<number[]>(new Array(20).fill(-1))
const selectedAnswer = ref(-1)
const testShowResult = ref(false)
const testScore = ref(0)
const isLastQuestionAnswered = ref(false)
const showTestConfirmModal = ref(false) // 是否显示测试确认弹窗
const showTestSummary = ref(false) // 是否显示测试总结页面

// 倒计时相关状态
const testTimeLeft = ref(180) // 3分钟 = 180秒
let timerInterval: ReturnType<typeof setInterval> | null = null

// 题目选择状态管理
interface QuestionSelectionState {
  usedIndices: number[] // 当前周期内已使用的索引
  cycleCount: number // 完成的周期数
}

let selectionState: QuestionSelectionState = {
  usedIndices: [],
  cycleCount: 0
}

// 从 localStorage 加载选择状态
const loadSelectionState = () => {
  try {
    const saved = localStorage.getItem('testQuestionSelectionState')
    if (saved) {
      selectionState = JSON.parse(saved)
    }
  } catch (e) {
    selectionState = { usedIndices: [], cycleCount: 0 }
  }
}

// 保存选择状态到 localStorage
const saveSelectionState = () => {
  try {
    localStorage.setItem('testQuestionSelectionState', JSON.stringify(selectionState))
  } catch (e) {
    console.error('Failed to save selection state', e)
  }
}

// 重置选择状态（开始新周期）
const resetSelectionState = () => {
  selectionState.usedIndices = []
  selectionState.cycleCount++
  saveSelectionState()
}

// 初始化时加载
loadSelectionState()

// 导航到指定页面
const navigateTo = (page: string) => {
  // 如果当前页面不是变格规则或历史记录，且导航目标是变格规则或历史记录，则保存当前页面状态
  if (currentPage.value !== 'declension-rules' && currentPage.value !== 'profile' && 
      (page === 'declension-rules' || page === 'profile')) {
    previousPage.value = currentPage.value
  }
  
  // 如果导航目标是主页，且之前保存的页面不是主页，则恢复之前的页面状态
  if (page === 'home' && previousPage.value !== 'home') {
    // 恢复之前的页面状态，不重置训练状态
    currentPage.value = previousPage.value
    previousPage.value = 'home' // 重置为默认值
    return // 直接返回，不执行后续逻辑
  }
  
  // 如果要进入测试页面，检查是否有未完成的测试
  if (page === 'test') {
    const savedProgress = localStorage.getItem('russianDeclensionTestProgress')
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress)
        if (progress.userAnswers && progress.userAnswers.some((a: number) => a !== -1)) {
          // 有未完成的测试，显示确认弹窗
          showTestConfirmModal.value = true
          return // 不立即导航，等待用户选择
        }
      } catch (e) {
        console.error('Error parsing saved progress:', e)
      }
    }
    // 没有未完成的测试，直接进入
    enterTestPage(false)
    return
  }
  
  // 离开测试页面时保存答题情况
  if (currentPage.value === 'test' && testState.value === 'ongoing') {
    saveTestProgress()
  }
  
  currentPage.value = page
  
  if (page === 'case-training') {
    // 只有在从主页进入时才重置状态
    if (previousPage.value === 'home') {
      caseTrainingState.value = 'select-case'
      selectedCase.value = null
      resetPracticeState()
    }
  }
}

// 进入测试页面
const enterTestPage = (continueTest: boolean) => {
  showTestConfirmModal.value = false
  currentPage.value = 'test'
  
  if (continueTest) {
    // 继续测试，从本地存储恢复
    loadTestProgress()
  } else {
    // 重新开始新测试
    resetTestState()
  }
}

// 保存答题情况到本地存储
const saveTestProgress = () => {
  if (testState.value === 'ongoing') {
    const testProgress = {
      currentQuestionIndex: currentQuestionIndex.value,
      userAnswers: userAnswers.value,
      selectedAnswer: selectedAnswer.value,
      testQuestions: testQuestions.value,
      timeLeft: testTimeLeft.value
    }
    localStorage.setItem('russianDeclensionTestProgress', JSON.stringify(testProgress))
  }
}

// 从本地存储恢复答题情况
const loadTestProgress = () => {
  const savedProgress = localStorage.getItem('russianDeclensionTestProgress')
  if (savedProgress) {
    try {
      const progress = JSON.parse(savedProgress)
      currentQuestionIndex.value = progress.currentQuestionIndex
      userAnswers.value = progress.userAnswers
      selectedAnswer.value = progress.selectedAnswer
      testQuestions.value = progress.testQuestions
      if (progress.timeLeft !== undefined) {
        testTimeLeft.value = progress.timeLeft
      }
      // 清除保存的进度，避免重复加载
      localStorage.removeItem('russianDeclensionTestProgress')
      startTimer()
      return true
    } catch (error) {
      console.error('Failed to load test progress:', error)
      return false
    }
  }
  return false
}

// 添加beforeunload事件监听器，在页面刷新或关闭时保存答题情况
window.addEventListener('beforeunload', () => {
  if (currentPage.value === 'test' && testState.value === 'ongoing') {
    saveTestProgress()
  }
})

// 生成测试题目
const generateTestQuestions = () => {
  const testQuestionPool = [
    // 1格（10题）
    { text: 'В классе учатся студент.', targetWord: 'студент', originalEnding: '', correctEnding: 'ы', possibleEndings: ['', 'ы', 'и', 'а'], explanation: 'студент 是阳性硬干名词，复数加 -ы。' },
    { text: 'Её брат — школьники.', targetWord: 'брат', originalEnding: '', correctEnding: 'ья', possibleEndings: ['', 'ья', 'ы', 'а'], explanation: 'брат 阳性，复数加 -ья。' },
    { text: 'В этом доме живут сосед.', targetWord: 'сосед', originalEnding: '', correctEnding: 'и', possibleEndings: ['', 'и', 'ы', 'а'], explanation: 'сосед 阳性，复数加 -и。' },
    { text: 'На кухне стоят стол.', targetWord: 'стол', originalEnding: '', correctEnding: 'ы', possibleEndings: ['', 'ы', 'и', 'а'], explanation: 'стол 阳性非动物，复数加 -ы。' },
    { text: 'Новые дом построены в центре.', targetWord: 'дом', originalEnding: '', correctEnding: 'а', possibleEndings: ['', 'а', 'ы', 'и'], explanation: 'дом 阳性，复数加 -а。' },
    { text: 'В этом доме большие окно.', targetWord: 'окно', originalEnding: 'о', correctEnding: 'а', possibleEndings: ['о', 'а', 'ы', 'и'], explanation: 'окно 中性，词尾 -о 变 -а。' },
    { text: 'На полке стоят книга.', targetWord: 'книга', originalEnding: 'а', correctEnding: 'и', possibleEndings: ['а', 'и', 'ы', 'ов'], explanation: 'книга 阴性，词尾 -а 变 -и。' },
    { text: 'В парке высокие дерево.', targetWord: 'дерево', originalEnding: '', correctEnding: '', possibleEndings: ['дерево', 'деревы', 'деревья', 'деревьи'], explanation: 'дерево 中性，复数 деревья（特殊变格）。', correctFullWord: 'деревья' },
    { text: 'Мои друг любят спорт.', targetWord: 'друг', originalEnding: '', correctEnding: '', possibleEndings: ['друг', 'други', 'другие', 'друзья'], explanation: '名词 друг（阳性，动物）的复数形式为 друзья，属于特殊变格。', correctFullWord: 'друзья' },
    { text: 'Мои сестра учатся в школе.', targetWord: 'сестра', originalEnding: '', correctEnding: '', possibleEndings: ['сестра', 'сестры', 'сестри', 'сёстры'], explanation: 'сестра 阴性，复数 сёстры（元音交替）。', correctFullWord: 'сёстры' },
    
    // 2格（30题）
    { text: 'У этого стол четыре ножки.', targetWord: 'стол', originalEnding: '', correctEnding: 'а', possibleEndings: ['', 'а', 'ы', 'у'], explanation: 'стол 阳性，二格直接加 -а。' },
    { text: 'Около этого дом растёт дерево.', targetWord: 'дом', originalEnding: '', correctEnding: 'а', possibleEndings: ['', 'а', 'ы', 'у'], explanation: 'дом 阳性，二格直接加 -а。' },
    { text: 'Мы ждём автобус из этого город.', targetWord: 'город', originalEnding: '', correctEnding: 'а', possibleEndings: ['', 'а', 'ы', 'у'], explanation: 'город 阳性，二格直接加 -а。' },
    { text: 'До этого год остался месяц.', targetWord: 'год', originalEnding: '', correctEnding: 'а', possibleEndings: ['', 'а', 'ы', 'у'], explanation: 'год 阳性，二格直接加 -а。' },
    { text: 'У этого друг есть машина.', targetWord: 'друг', originalEnding: '', correctEnding: 'а', possibleEndings: ['', 'а', 'ы', 'у'], explanation: 'друг 阳性，二格直接加 -а。' },
    { text: 'Без этого кот мы скучаем.', targetWord: 'кот', originalEnding: '', correctEnding: 'а', possibleEndings: ['', 'а', 'ы', 'у'], explanation: 'кот 阳性，二格直接加 -а。' },
    { text: 'У этого студент хорошие оценки.', targetWord: 'студент', originalEnding: '', correctEnding: 'а', possibleEndings: ['', 'а', 'ы', 'у'], explanation: 'студент 阳性，二格直接加 -а。' },
    { text: 'Я старше брат.', targetWord: 'брат', originalEnding: '', correctEnding: 'а', possibleEndings: ['', 'а', 'ы', 'у'], explanation: 'брат 阳性，二格直接加 -а。' },
    { text: 'После долгого путь мы отдохнули.', targetWord: 'путь', originalEnding: 'ь', correctEnding: 'и', possibleEndings: ['ь', 'и', 'ы', 'у'], explanation: 'путь 阳性，词尾 -ь 变 -и。' },
    { text: 'Для этого учитель это важно.', targetWord: 'учитель', originalEnding: 'ь', correctEnding: 'я', possibleEndings: ['ь', 'я', 'и', 'ы'], explanation: 'учитель 阳性，词尾 -ь 变 -я。' },
    { text: 'В комнате много столы.', targetWord: 'столы', originalEnding: 'ы', correctEnding: 'ов', possibleEndings: ['ы', 'ов', 'ам', 'ами'], explanation: 'столы 复数，词尾 -ы 变 -ов。' },
    { text: 'На улице много дома.', targetWord: 'дома', originalEnding: 'а', correctEnding: 'ов', possibleEndings: ['а', 'ов', 'ам', 'ами'], explanation: 'дома 复数，词尾 -а 变 -ов。' },
    { text: 'В этой стране много города.', targetWord: 'города', originalEnding: 'а', correctEnding: 'ов', possibleEndings: ['а', 'ов', 'ам', 'ами'], explanation: 'города 复数，词尾 -а 变 -ов。' },
    { text: 'У меня нет часы.', targetWord: 'часы', originalEnding: 'ы', correctEnding: 'ов', possibleEndings: ['ы', 'ов', 'ам', 'ами'], explanation: 'часы 复数，词尾 -ы 变 -ов。' },
    { text: 'У нас много пути.', targetWord: 'пути', originalEnding: 'и', correctEnding: 'ей', possibleEndings: ['и', 'ей', 'ям', 'ями'], explanation: 'пути 复数，词尾 -и 变 -ей。' },
    { text: 'В зале много люди.', targetWord: 'люди', originalEnding: 'и', correctEnding: 'ей', possibleEndings: ['и', 'ей', 'ям', 'ями'], explanation: 'люди 复数，词尾 -и 变 -ей。' },
    { text: 'У меня много друзья.', targetWord: 'друзья', originalEnding: 'зья', correctEnding: 'зей', possibleEndings: ['зья', 'зей', 'ям', 'ями'], explanation: 'друзья 复数，词尾 -ья 变 -ей。' },
    { text: 'У этого окно разбито стекло.', targetWord: 'окно', originalEnding: 'о', correctEnding: 'а', possibleEndings: ['о', 'а', 'у', 'ом'], explanation: 'окно 中性，词尾 -о 变 -а。' },
    { text: 'Для этого письмо нужен конверт.', targetWord: 'письмо', originalEnding: 'о', correctEnding: 'а', possibleEndings: ['о', 'а', 'у', 'ом'], explanation: 'письмо 中性，词尾 -о 变 -а。' },
    { text: 'У меня нет время.', targetWord: 'время', originalEnding: 'мя', correctEnding: 'мени', possibleEndings: ['мя', 'мени', 'мю', 'мем'], explanation: 'время 中性，词尾 -мя 变 -мени。' },
    { text: 'В зале нет свободного место.', targetWord: 'место', originalEnding: 'о', correctEnding: 'а', possibleEndings: ['о', 'а', 'у', 'ом'], explanation: 'место 中性，词尾 -о 变 -а。' },
    { text: 'Мы отдыхали у море.', targetWord: 'море', originalEnding: 'е', correctEnding: 'я', possibleEndings: ['е', 'я', 'у', 'ем'], explanation: 'море 中性，词尾 -е 变 -я。' },
    { text: 'У этой книга красивая обложка.', targetWord: 'книга', originalEnding: 'га', correctEnding: 'ги', possibleEndings: ['га', 'ги', 'ге', 'гу'], explanation: 'книга 阴性，词尾 -а 变 -и。' },
    { text: 'Около этой дверь стоит стул.', targetWord: 'дверь', originalEnding: 'ь', correctEnding: 'и', possibleEndings: ['ь', 'и', 'е', 'ю'], explanation: 'дверь 阴性，词尾 -ь 变 -и。' },
    { text: 'Из этой комната вышел человек.', targetWord: 'комната', originalEnding: 'а', correctEnding: 'ы', possibleEndings: ['а', 'ы', 'е', 'у'], explanation: 'комната 阴性，词尾 -а 变 -ы。' },
    { text: 'В бутылке нет холодной вода.', targetWord: 'вода', originalEnding: 'а', correctEnding: 'ы', possibleEndings: ['а', 'ы', 'е', 'у'], explanation: 'вода 阴性，词尾 -а 变 -ы。' },
    { text: 'У этой семья трое детей.', targetWord: 'семья', originalEnding: 'я', correctEnding: 'и', possibleEndings: ['я', 'и', 'е', 'ю'], explanation: 'семья 阴性，词尾 -я 变 -и。' },
    { text: 'У этой женщина красивые глаза.', targetWord: 'женщина', originalEnding: 'а', correctEnding: 'ы', possibleEndings: ['а', 'ы', 'е', 'у'], explanation: 'женщина 阴性，词尾 -а 变 -ы。' },
    { text: 'В доме много окна.', targetWord: 'окна', originalEnding: '', correctEnding: '', possibleEndings: ['окна', 'окон', 'окнам', 'окнами'], explanation: 'окна 复数，词尾消失且移动元音（特殊变格）。', correctFullWord: 'окон' },
    { text: 'В этом районе много семьи.', targetWord: 'семьи', originalEnding: '', correctEnding: '', possibleEndings: ['семьи', 'семей', 'семьям', 'семьями'], explanation: 'семьи 复数，词尾消失且移动元音（特殊变格）。', correctFullWord: 'семей' },
    
    // 3格（40题）
    { text: 'Я даю книгу друг.', targetWord: 'друг', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'друг 阳性名词，第三格加-у → другу。' },
    { text: 'Мы идём к врач.', targetWord: 'врач', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'врач 阳性名词，第三格加-у → врачу。' },
    { text: 'Учитель объясняет урок ученик.', targetWord: 'ученик', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'ученик 阳性名词，第三格加-у → ученику。' },
    { text: 'Я посылаю сообщение брат.', targetWord: 'брат', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'брат 阳性名词，第三格加-у → брату。' },
    { text: 'Он рад подарок.', targetWord: 'подарок', originalEnding: '', correctEnding: '', possibleEndings: ['подарку', 'подарка', 'подарком', 'подарке'], explanation: 'подарок 阳性名词，变格时词尾变化 → подарку。', correctFullWord: 'подарку' },
    { text: 'Мне нужно позвонить отец.', targetWord: 'отец', originalEnding: '', correctEnding: '', possibleEndings: ['отцу', 'отца', 'отцом', 'отце'], explanation: 'отец 阳性名词，变格时词尾变化 → отцу。', correctFullWord: 'отцу' },
    { text: 'Мы готовимся к экзамен.', targetWord: 'экзамен', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'экзамен 阳性名词，第三格加-у → экзамену。' },
    { text: 'Я советую студент читать книгу.', targetWord: 'студент', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'студент 阳性名词，第三格加-у → студенту。' },
    { text: 'Он учится русскому язык.', targetWord: 'язык', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'язык 阳性名词，第三格加-у → языку。' },
    { text: 'Он мешает сосед.', targetWord: 'сосед', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'сосед 阳性名词，第三格加-у → соседу。' },
    { text: 'Кошка идёт к хозяин.', targetWord: 'хозяин', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'хозяин 阳性名词，第三格加-у → хозяину。' },
    { text: 'Дети радуются праздник.', targetWord: 'праздник', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'праздник 阳性名词，第三格加-у → празднику。' },
    { text: 'Он звонит товарищ.', targetWord: 'товарищ', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'товарищ 阳性名词，第三格加-у → товарищу。' },
    { text: 'Мы пишем сочинение по план.', targetWord: 'план', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'план 阳性名词，第三格加-у → плану。' },
    { text: 'Я купил подарок сын.', targetWord: 'сын', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'сын 阳性名词，第三格加-у → сыну。' },
    { text: 'Студенты готовятся к зачёт.', targetWord: 'зачёт', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'зачёт 阳性名词，第三格加-у → зачёту。' },
    { text: 'Я послал письмо директор.', targetWord: 'директор', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'директор 阳性名词，第三格加-у → директору。' },
    { text: 'Мы гуляем по парк.', targetWord: 'парк', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'парк 阳性名词，第三格加-у → парку。' },
    { text: 'Мы следуем совет врача.', targetWord: 'совет', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'ю', 'ам', 'ям'], explanation: 'совет 阳性名词，第三格加-у → совету。' },
    { text: 'Он завидует приятель.', targetWord: 'приятель', originalEnding: 'ь', correctEnding: 'ю', possibleEndings: ['ю', 'у', 'ам', 'ям'], explanation: 'приятель 阳性名词，词尾-ь→-ю → приятелю。' },
    { text: 'Я обещаю знакомый помочь.', targetWord: 'знакомый', originalEnding: 'ый', correctEnding: 'ому', possibleEndings: ['ому', 'ому', 'ам', 'ям'], explanation: 'знакомый 形容词化名词，第三格→знакомому。' },
    { text: 'Мы верим дети.', targetWord: 'дети', originalEnding: 'и', correctEnding: 'ям', possibleEndings: ['ям', 'ам', 'у', 'ю'], explanation: 'дети 复数，词尾-и→-ям → детям。' },
    { text: 'Я пишу письмо родители.', targetWord: 'родители', originalEnding: 'и', correctEnding: 'ям', possibleEndings: ['ям', 'ам', 'у', 'ю'], explanation: 'родители 复数，词尾-и→-ям → родителям。' },
    { text: 'Он показывает город туристы.', targetWord: 'туристы', originalEnding: 'ы', correctEnding: 'ам', possibleEndings: ['ам', 'ям', 'у', 'ю'], explanation: 'туристы 复数，词尾-ы→-ам → туристам。' },
    { text: 'Он помогает родственники.', targetWord: 'родственники', originalEnding: 'и', correctEnding: 'ам', possibleEndings: ['ам', 'ям', 'у', 'ю'], explanation: 'родственники 复数，词尾-и→-ам → родственникам。' },
    { text: 'Мы сочувствуем пострадавшие.', targetWord: 'пострадавшие', originalEnding: 'ие', correctEnding: 'им', possibleEndings: ['им', 'ам', 'ям', 'у'], explanation: 'пострадавшие 形容词化名词复数，词尾-ие→-им → пострадавшим。' },
    { text: 'Дети рады яблоки.', targetWord: 'яблоки', originalEnding: 'и', correctEnding: 'ам', possibleEndings: ['ам', 'ям', 'у', 'ю'], explanation: 'яблоки 复数，词尾-и→-ам → яблокам。' },
    { text: 'Он помогает сестра.', targetWord: 'сестра', originalEnding: 'а', correctEnding: 'е', possibleEndings: ['е', 'у', 'ы', 'ой'], explanation: 'сестра 阴性名词，词尾-а→-е → сестре。' },
    { text: 'Дети пишут письмо бабушка.', targetWord: 'бабушка', originalEnding: 'а', correctEnding: 'е', possibleEndings: ['е', 'у', 'ы', 'ой'], explanation: 'бабушка 阴性名词，词尾-а→-е → бабушке。' },
    { text: 'Я звоню мама.', targetWord: 'мама', originalEnding: 'а', correctEnding: 'е', possibleEndings: ['е', 'у', 'ы', 'ой'], explanation: 'мама 阴性名词，词尾-а→-е → маме。' },
    { text: 'Кот бежит к мышь.', targetWord: 'мышь', originalEnding: 'ь', correctEnding: 'и', possibleEndings: ['и', 'ю', 'у', 'е'], explanation: 'мышь 阴性名词，词尾-ь→-и → мыши。' },
    { text: 'Она покупает подарок подруга.', targetWord: 'подруга', originalEnding: 'а', correctEnding: 'е', possibleEndings: ['е', 'у', 'ы', 'ой'], explanation: 'подруга 阴性名词，词尾-а→-е → подруге。' },
    { text: 'Мы гуляем по улица.', targetWord: 'улица', originalEnding: 'а', correctEnding: 'е', possibleEndings: ['е', 'у', 'ы', 'ой'], explanation: 'улица 阴性名词，词尾-а→-е → улице。' },
    { text: 'Дети идут к учительница.', targetWord: 'учительница', originalEnding: 'а', correctEnding: 'е', possibleEndings: ['е', 'у', 'ы', 'ой'], explanation: 'учительница 阴性名词，词尾-а→-е → учительнице。' },
    { text: 'Я помогаю дедушка.', targetWord: 'дедушка', originalEnding: 'а', correctEnding: 'е', possibleEndings: ['е', 'у', 'ы', 'ой'], explanation: 'дедушка 阳性名词（按阴性变），词尾-а→-е → дедушке。' },
    { text: 'Студенты отвечают преподаватель.', targetWord: 'преподаватель', originalEnding: 'ь', correctEnding: 'ю', possibleEndings: ['ю', 'у', 'и', 'е'], explanation: 'преподаватель 阳性名词，词尾-ь→-ю → преподавателю。' },
    { text: 'Мы идём по поле.', targetWord: 'поле', originalEnding: 'е', correctEnding: 'ю', possibleEndings: ['ю', 'у', 'а', 'ом'], explanation: 'поле 中性名词，词尾-е→-ю → полю。' },
    { text: 'Мы идём к море.', targetWord: 'море', originalEnding: 'е', correctEnding: 'ю', possibleEndings: ['ю', 'у', 'а', 'ом'], explanation: 'море 中性名词，词尾-е→-ю → морю。' },
    
    // 4格（25题）
    { text: 'Он любит друг.', targetWord: 'друг', originalEnding: '', correctEnding: 'а', possibleEndings: ['а', 'у', 'ом', 'е'], explanation: 'друг 阳性动物名词，第四格直接加-а → друга。' },
    { text: 'Я вижу брат.', targetWord: 'брат', originalEnding: '', correctEnding: 'а', possibleEndings: ['а', 'у', 'ом', 'е'], explanation: 'брат 阳性动物名词，第四格直接加-а → брата。' },
    { text: 'Она ждёт сын.', targetWord: 'сын', originalEnding: '', correctEnding: 'а', possibleEndings: ['а', 'у', 'ом', 'е'], explanation: 'сын 阳性动物名词，第四格直接加-а → сына。' },
    { text: 'Ты видишь кот?', targetWord: 'кот', originalEnding: '', correctEnding: 'а', possibleEndings: ['а', 'у', 'ом', 'е'], explanation: 'кот 阳性动物名词，第四格直接加-а → кота。' },
    { text: 'Мы знаем студент.', targetWord: 'студент', originalEnding: '', correctEnding: 'а', possibleEndings: ['а', 'у', 'ом', 'е'], explanation: 'студент 阳性动物名词，第四格直接加-а → студента。' },
    { text: 'Они слушают врач.', targetWord: 'врач', originalEnding: '', correctEnding: 'а', possibleEndings: ['а', 'у', 'ом', 'е'], explanation: 'врач 阳性动物名词，第四格直接加-а → врача。' },
    { text: 'Студенты отвечают преподаватель.', targetWord: 'преподаватель', originalEnding: 'ь', correctEnding: 'я', possibleEndings: ['я', 'ю', 'и', 'е'], explanation: 'преподаватель 阳性动物名词，词尾-ь→-я → преподавателя。' },
    { text: 'Ученики слушают учитель.', targetWord: 'учитель', originalEnding: 'ь', correctEnding: 'я', possibleEndings: ['я', 'ю', 'и', 'е'], explanation: 'учитель 阳性动物名词，词尾-ь→-я → учителя。' },
    { text: 'Он любит сестра.', targetWord: 'сестра', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'сестра 阴性名词，词尾-а→-у → сестру。' },
    { text: 'Ты любишь мама?', targetWord: 'мама', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'мама 阴性名词，词尾-а→-у → маму。' },
    { text: 'Мы помним бабушка.', targetWord: 'бабушка', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'бабушка 阴性名词，词尾-а→-у → бабушку。' },
    { text: 'Она ждёт девушка.', targetWord: 'девушка', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'девушка 阴性名词，词尾-а→-у → девушку。' },
    { text: 'Ты видишь кошка?', targetWord: 'кошка', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'кошка 阴性名词，词尾-а→-у → кошку。' },
    { text: 'Они видят собака.', targetWord: 'собака', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'собака 阴性名词，词尾-а→-у → собаку。' },
    { text: 'Я читаю книга.', targetWord: 'книга', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'книга 阴性名词，词尾-а→-у → книгу。' },
    { text: 'Ты пишешь ручка?', targetWord: 'ручка', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'ручка 阴性名词，词尾-а→-у → ручку。' },
    { text: 'Мы убираем комната.', targetWord: 'комната', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'комната 阴性名词，词尾-а→-у → комнату。' },
    { text: 'Она чистит машина.', targetWord: 'машина', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'машина 阴性名词，词尾-а→-у → машину。' },
    { text: 'Ты любишь работа?', targetWord: 'работа', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'работа 阴性名词，词尾-а→-у → работу。' },
    { text: 'Мы идём в школа.', targetWord: 'школа', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'школа 阴性名词，词尾-а→-у → школу。' },
    { text: 'Он видит подруга.', targetWord: 'подруга', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'подруга 阴性名词，词尾-а→-у → подругу。' },
    { text: 'Ученики слушают учительница.', targetWord: 'учительница', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'учительница 阴性名词，词尾-а→-у → учительницу。' },
    { text: 'Ты любишь жена?', targetWord: 'жена', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'жена 阴性名词，词尾-а→-у → жену。' },
    { text: 'Она читает газета.', targetWord: 'газета', originalEnding: 'а', correctEnding: 'у', possibleEndings: ['у', 'ы', 'е', 'ой'], explanation: 'газета 阴性名词，词尾-а→-у → газету。' },
    
    // 5格（40题）
    { text: 'Он доволен стол.', targetWord: 'стол', originalEnding: '', correctEnding: 'ом', possibleEndings: ['ом', 'а', 'у', 'е'], explanation: 'стол 阳性名词，工具格直接加 -ом → столом。' },
    { text: 'Мы гордимся дом.', targetWord: 'дом', originalEnding: '', correctEnding: 'ом', possibleEndings: ['ом', 'а', 'у', 'е'], explanation: 'дом 阳性名词，工具格直接加 -ом → домом。' },
    { text: 'Он рисует карандаш.', targetWord: 'карандаш', originalEnding: '', correctEnding: 'ом', possibleEndings: ['ом', 'а', 'ем', 'у'], explanation: 'карандаш 阳性名词，工具格直接加 -ом → карандашом。' },
    { text: 'Я пользуюсь телефон.', targetWord: 'телефон', originalEnding: '', correctEnding: 'ом', possibleEndings: ['ом', 'а', 'у', 'е'], explanation: 'телефон 阳性名词，工具格直接加 -ом → телефоном。' },
    { text: 'Студент пользуется учебник.', targetWord: 'учебник', originalEnding: '', correctEnding: 'ом', possibleEndings: ['ом', 'а', 'у', 'е'], explanation: 'учебник 阳性名词，工具格直接加 -ом → учебником。' },
    { text: 'Он наслаждается чай.', targetWord: 'чай', originalEnding: '', correctEnding: 'ем', possibleEndings: ['ем', 'я', 'ю', 'ом'], explanation: 'чай 阳性名词，工具格直接加 -ем → чаем。' },
    { text: 'Он ест суп с хлеб.', targetWord: 'хлеб', originalEnding: '', correctEnding: 'ом', possibleEndings: ['ом', 'а', 'у', 'е'], explanation: 'хлеб 阳性名词，工具格直接加 -ом → хлебом。' },
    { text: 'Я иду в кино с друг.', targetWord: 'друг', originalEnding: '', correctEnding: 'ом', possibleEndings: ['ом', 'а', 'у', 'е'], explanation: 'друг 阳性名词，工具格直接加 -ом → другом。' },
    { text: 'Она разговаривает с брат.', targetWord: 'брат', originalEnding: '', correctEnding: 'ом', possibleEndings: ['ом', 'а', 'у', 'е'], explanation: 'брат 阳性名词，工具格直接加 -ом → братом。' },
    { text: 'Он работает врач.', targetWord: 'врач', originalEnding: '', correctEnding: 'ом', possibleEndings: ['ом', 'а', 'ем', 'у'], explanation: 'врач 阳性名词，工具格直接加 -ом → врачом。' },
    { text: 'Он стал студент.', targetWord: 'студент', originalEnding: '', correctEnding: 'ом', possibleEndings: ['ом', 'а', 'у', 'е'], explanation: 'студент 阳性名词，工具格直接加 -ом → студентом。' },
    { text: 'Я познакомился с сосед.', targetWord: 'сосед', originalEnding: '', correctEnding: 'ом', possibleEndings: ['ом', 'а', 'у', 'е'], explanation: 'сосед 阳性名词，工具格直接加 -ом → соседом。' },
    { text: 'Он любуется окно.', targetWord: 'окно', originalEnding: '', correctEnding: 'м', possibleEndings: ['м', 'а', 'у', 'е'], explanation: 'окно 中性名词，工具格直接加 -м → окном。' },
    { text: 'Он думает над слово.', targetWord: 'слово', originalEnding: '', correctEnding: 'м', possibleEndings: ['м', 'а', 'у', 'е'], explanation: 'слово 中性名词，工具格直接加 -м → словом。' },
    { text: 'Он занят письмо.', targetWord: 'письмо', originalEnding: '', correctEnding: 'м', possibleEndings: ['м', 'а', 'у', 'е'], explanation: 'письмо 中性名词，工具格直接加 -м → письмом。' },
    { text: 'Мы любуемся море.', targetWord: 'море', originalEnding: '', correctEnding: 'м', possibleEndings: ['м', 'я', 'ю', 'е'], explanation: 'море 中性名词，工具格直接加 -м → морем。' },
    { text: 'Он стоит перед ворота.', targetWord: 'ворота', originalEnding: '', correctEnding: 'ми', possibleEndings: ['ми', 'в', 'ам', 'ах'], explanation: 'ворота 复数名词，工具格直接加 -ми → воротами。' },
    { text: 'Моя мама работает учитель.', targetWord: 'учитель', originalEnding: 'ь', correctEnding: 'ем', possibleEndings: ['ем', 'я', 'ю', 'ом'], explanation: 'учитель 阳性名词，-ь 变为 -ем → учителем。' },
    { text: 'Я интересуюсь книга.', targetWord: 'книга', originalEnding: 'а', correctEnding: 'ой', possibleEndings: ['ой', 'ы', 'е', 'у'], explanation: 'книга 阴性名词，-а 变为 -ой → книгой。' },
    { text: 'Он пишет ручка.', targetWord: 'ручка', originalEnding: 'а', correctEnding: 'ой', possibleEndings: ['ой', 'ы', 'е', 'у'], explanation: 'ручка 阴性名词，-а 变为 -ой → ручкой。' },
    { text: 'Мы управляем машина.', targetWord: 'машина', originalEnding: 'а', correctEnding: 'ой', possibleEndings: ['ой', 'ы', 'е', 'у'], explanation: 'машина 阴性名词，-а 变为 -ой → машиной。' },
    { text: 'Она гордится школа.', targetWord: 'школа', originalEnding: 'а', correctEnding: 'ой', possibleEndings: ['ой', 'ы', 'е', 'у'], explanation: 'школа 阴性名词，-а 变为 -ой → школой。' },
    { text: 'Мы довольны квартира.', targetWord: 'квартира', originalEnding: 'а', correctEnding: 'ой', possibleEndings: ['ой', 'ы', 'е', 'у'], explanation: 'квартира 阴性名词，-а 变为 -ой → квартирой。' },
    { text: 'Он моет руки вода.', targetWord: 'вода', originalEnding: 'а', correctEnding: 'ой', possibleEndings: ['ой', 'ы', 'е', 'у'], explanation: 'вода 阴性名词，-а 变为 -ой → водой。' },
    { text: 'Он увлекается музыка.', targetWord: 'музыка', originalEnding: 'а', correctEnding: 'ой', possibleEndings: ['ой', 'ы', 'е', 'у'], explanation: 'музыка 阴性名词，-а 变为 -ой → музыкой。' },
    { text: 'Я гуляю с сестра.', targetWord: 'сестра', originalEnding: 'а', correctEnding: 'ой', possibleEndings: ['ой', 'ы', 'е', 'у'], explanation: 'сестра 阴性名词，-а 变为 -ой → сестрой。' },
    { text: 'Мальчик дружит с девочка.', targetWord: 'девочка', originalEnding: 'а', correctEnding: 'ой', possibleEndings: ['ой', 'ы', 'е', 'у'], explanation: 'девочка 阴性名词，-а 变为 -ой → девочкой。' },
    { text: 'Он познакомился с женщина.', targetWord: 'женщина', originalEnding: 'а', correctEnding: 'ой', possibleEndings: ['ой', 'ы', 'е', 'у'], explanation: 'женщина 阴性名词，-а 变为 -ой → женщиной。' },
    { text: 'Дети играют с собака.', targetWord: 'собака', originalEnding: 'а', correctEnding: 'ой', possibleEndings: ['ой', 'ы', 'е', 'у'], explanation: 'собака 阴性名词，-а 变为 -ой → собакой。' },
    { text: 'Девочка играет с кошка.', targetWord: 'кошка', originalEnding: 'а', correctEnding: 'ой', possibleEndings: ['ой', 'ы', 'е', 'у'], explanation: 'кошка 阴性名词，-а 变为 -ой → кошкой。' },
    { text: 'Он платит деньги.', targetWord: 'деньги', originalEnding: 'и', correctEnding: 'ами', possibleEndings: ['ами', 'г', 'гам', 'гах'], explanation: 'деньги 复数名词，-и 变为 -ами → деньгами。' },
    { text: 'Он измеряет время часы.', targetWord: 'часы', originalEnding: 'ы', correctEnding: 'ами', possibleEndings: ['ами', 'ов', 'ам', 'ах'], explanation: 'часы 复数名词，-ы 变为 -ами → часами。' },
    { text: 'Он пользуется очки.', targetWord: 'очки', originalEnding: 'и', correctEnding: 'ами', possibleEndings: ['ами', 'к', 'кам', 'ках'], explanation: 'очки 复数名词，-и 变为 -ами → очками。' },
    { text: 'Она режет бумагу ножницы.', targetWord: 'ножницы', originalEnding: 'ы', correctEnding: 'ами', possibleEndings: ['ами', 'ц', 'цам', 'цах'], explanation: 'ножницы 复数名词，-ы 变为 -ами → ножницами。' },
    { text: 'Он доволен брюки.', targetWord: 'брюки', originalEnding: 'и', correctEnding: 'ами', possibleEndings: ['ами', 'к', 'кам', 'ках'], explanation: 'брюки 复数名词，-и 变为 -ами → брюками。' },
    { text: 'Он живёт с отец.', targetWord: 'отец', originalEnding: '', correctEnding: '', possibleEndings: ['отцом', 'отца', 'отцу', 'отце'], explanation: 'отец 阳性名词，变格时 е 脱落 → отцом。', correctFullWord: 'отцом' },
    { text: 'Он говорит с мать.', targetWord: 'мать', originalEnding: '', correctEnding: '', possibleEndings: ['матерью', 'матери', 'матери', 'матери'], explanation: 'мать 阴性名词，变格时增加 -ер- → матерью。', correctFullWord: 'матерью' },
    { text: 'Она гордится дочь.', targetWord: 'дочь', originalEnding: '', correctEnding: '', possibleEndings: ['дочерью', 'дочери', 'дочери', 'дочери'], explanation: 'дочь 阴性名词，变格时增加 -ер- → дочерью。', correctFullWord: 'дочерью' },
    { text: 'Он общается с люди.', targetWord: 'люди', originalEnding: '', correctEnding: '', possibleEndings: ['людьми', 'людей', 'людям', 'людях'], explanation: 'люди 复数名词，词干变化 → людьми。', correctFullWord: 'людьми' },
    { text: 'Она играет с дети.', targetWord: 'дети', originalEnding: '', correctEnding: '', possibleEndings: ['детьми', 'детей', 'детям', 'детях'], explanation: 'дети 复数名词，词干变化 → детьми。', correctFullWord: 'детьми' },
    
    // 6格（30题）
    { text: 'Мы живём в доме.', targetWord: 'дом', originalEnding: '', correctEnding: 'е', possibleEndings: ['е', 'а', 'у', 'ом'], explanation: 'дом 阳性名词，前置格直接加 -е → доме。' },
    { text: 'Они гуляли в густом лес.', targetWord: 'лес', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'е', 'а', 'ом'], explanation: 'лес 阳性名词，前置格特殊形式 -у → лесу。' },
    { text: 'Дети играют в красивом сад.', targetWord: 'сад', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'е', 'а', 'ом'], explanation: 'сад 阳性名词，前置格特殊形式 -у → саду。' },
    { text: 'Он встретил меня в международном аэропорт.', targetWord: 'аэропорт', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'е', 'а', 'ом'], explanation: 'аэропорт 阳性名词，特殊变化，前置格直接加 -у → аэропорту。' },
    { text: 'Это случилось в прошлом год.', targetWord: 'год', originalEnding: '', correctEnding: 'у', possibleEndings: ['у', 'е', 'а', 'ом'], explanation: 'год 阳性名词，前置格直接加 -у → году。' },
    { text: 'Он рассказал о том человек.', targetWord: 'человек', originalEnding: '', correctEnding: 'е', possibleEndings: ['е', 'а', 'у', 'ом'], explanation: 'человек 阳性名词，前置格直接加 -е → человеке。' },
    { text: 'Я часто думаю о моём друг.', targetWord: 'друг', originalEnding: '', correctEnding: 'е', possibleEndings: ['е', 'а', 'у', 'ом'], explanation: 'друг 阳性名词，前置格直接加 -е → друге。' },
    { text: 'Он заботится о своём брат.', targetWord: 'брат', originalEnding: '', correctEnding: 'е', possibleEndings: ['е', 'а', 'у', 'ом'], explanation: 'брат 阳性名词，前置格直接加 -е → брате。' },
    { text: 'Они живут в новых дома.', targetWord: 'дома', originalEnding: '', correctEnding: '', possibleEndings: ['домах', 'домов', 'домами', 'домом'], explanation: 'дом 复数，前置格直接加 -х → домах。', correctFullWord: 'домах' },
    { text: 'Мы были в разных города.', targetWord: 'города', originalEnding: '', correctEnding: '', possibleEndings: ['городах', 'городов', 'городами', 'городом'], explanation: 'город 复数，前置格直接加 -х → городах。', correctFullWord: 'городах' },
    { text: 'Они гуляли в густых леса.', targetWord: 'леса', originalEnding: '', correctEnding: '', possibleEndings: ['лесах', 'лесов', 'лесами', 'лесом'], explanation: 'леса 复数，前置格直接变 -ах → лесах。', correctFullWord: 'лесах' },
    { text: 'Он думает о минувших года.', targetWord: 'года', originalEnding: '', correctEnding: '', possibleEndings: ['годах', 'годов', 'годами', 'годом'], explanation: 'год 复数，前置格直接加 -х → годах。', correctFullWord: 'годах' },
    { text: 'Мы живём в разных страна.', targetWord: 'страна', originalEnding: '', correctEnding: '', possibleEndings: ['странах', 'стран', 'странами', 'страной'], explanation: 'страна 复数，前置格直接加 -х → странах。', correctFullWord: 'странах' },
    { text: 'На старых улица.', targetWord: 'улица', originalEnding: '', correctEnding: '', possibleEndings: ['улицах', 'улиц', 'улицами', 'улицей'], explanation: 'улица 复数，前置格直接加 -х → улицах。', correctFullWord: 'улицах' },
    { text: 'Я нашёл это слово в этом словарь.', targetWord: 'словарь', originalEnding: 'ь', correctEnding: 'е', possibleEndings: ['е', 'я', 'и', 'ю'], explanation: 'словарь -ь 变为 -е → словаре。' },
    { text: 'Ошибка в этой книга.', targetWord: 'книга', originalEnding: 'а', correctEnding: 'е', possibleEndings: ['е', 'ы', 'у', 'ю'], explanation: 'книга -а 变为 -е → книге。' },
    { text: 'Он записал это в синей тетрадь.', targetWord: 'тетрадь', originalEnding: 'ь', correctEnding: 'и', possibleEndings: ['и', 'е', 'ю', 'я'], explanation: 'тетрадь -ь 变为 -и → тетради。' },
    { text: 'Надпись на той дверь.', targetWord: 'дверь', originalEnding: 'ь', correctEnding: 'и', possibleEndings: ['и', 'е', 'ю', 'я'], explanation: 'дверь -ь 变为 -и → двери。' },
    { text: 'Картина висит на белой стена.', targetWord: 'стена', originalEnding: 'а', correctEnding: 'е', possibleEndings: ['е', 'ы', 'у', 'ю'], explanation: 'стена -а 变为 -е → стене。' },
    { text: 'Мы гуляли на центральной улица.', targetWord: 'улица', originalEnding: 'а', correctEnding: 'е', possibleEndings: ['е', 'ы', 'у', 'ю'], explanation: 'улица -а 变为 -е → улице。' },
    { text: 'Они встретились на главной площадь.', targetWord: 'площадь', originalEnding: 'ь', correctEnding: 'и', possibleEndings: ['и', 'е', 'ю', 'я'], explanation: 'площадь -ь 变为 -и → площади。' },
    { text: 'Мы купались в холодной река.', targetWord: 'река', originalEnding: 'а', correctEnding: 'е', possibleEndings: ['е', 'ы', 'у', 'ю'], explanation: 'река -а 变为 -е → реке。' },
    { text: 'Я живу в большой страна.', targetWord: 'страна', originalEnding: 'а', correctEnding: 'е', possibleEndings: ['е', 'ы', 'у', 'ю'], explanation: 'страна -а 变为 -е → стране。' },
    { text: 'У него проблемы в его семья.', targetWord: 'семья', originalEnding: 'я', correctEnding: 'е', possibleEndings: ['е', 'ы', 'и', 'ю'], explanation: 'семья -я 变为 -е → семье。' },
    { text: 'Ошибка в этом письмо.', targetWord: 'письмо', originalEnding: 'о', correctEnding: 'е', possibleEndings: ['е', 'а', 'у', 'ом'], explanation: 'письмо -о 变为 -е → письме。' },
    { text: 'Мы сидели на удобном место.', targetWord: 'место', originalEnding: 'о', correctEnding: 'е', possibleEndings: ['е', 'а', 'у', 'ом'], explanation: 'место -о 变为 -е → месте。' },
    { text: 'Мы находимся в высоком здание.', targetWord: 'здание', originalEnding: 'ие', correctEnding: 'ии', possibleEndings: ['ии', 'ия', 'ием', 'ия'], explanation: 'здание -ие 变为 -ии → здании。' },
    { text: 'Он искал информацию в этих книги.', targetWord: 'книги', originalEnding: '', correctEnding: '', possibleEndings: ['книгах', 'книг', 'книгами', 'книгой'], explanation: 'книга 复数 -и 变为 -ах → книгах。', correctFullWord: 'книгах' },
    { text: 'Ошибки в этих тетради.', targetWord: 'тетради', originalEnding: '', correctEnding: '', possibleEndings: ['тетрадях', 'тетрадей', 'тетрадями', 'тетрадью'], explanation: 'тетрадь 复数 -и 变为 -ях → тетрадях。', correctFullWord: 'тетрадях' },
    { text: 'Люди собрались на центральных площади.', targetWord: 'площади', originalEnding: '', correctEnding: '', possibleEndings: ['площадях', 'площадей', 'площадями', 'площадью'], explanation: 'площадь 复数 -и 变为 -ях → площадях。', correctFullWord: 'площадях' }
  ]
  
  const pool = [...testQuestionPool]
  const totalQuestions = pool.length
  
  // Fisher-Yates 洗牌算法
  const shuffle = (array: number[]) => {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = arr[i]
      arr[i] = arr[j] as number
      arr[j] = temp as number
    }
    return arr
  }
  
  // 获取当前周期内未使用的索引
  const getAvailableIndices = () => {
    const usedSet = new Set(selectionState.usedIndices)
    const available: number[] = []
    for (let i = 0; i < totalQuestions; i++) {
      if (!usedSet.has(i)) {
        available.push(i)
      }
    }
    return available
  }
  
  let availableIndices = getAvailableIndices()
  
  // 检查是否需要重置（可用题目少于15道）
  if (availableIndices.length < 15 && selectionState.usedIndices.length > 0) {
    resetSelectionState()
    availableIndices = getAvailableIndices()
  }
  
  let selectedIndices: number[] = []
  
  // 正常情况：从当前周期未使用的题目中选择
  if (availableIndices.length >= 15) {
    const shuffled = shuffle(availableIndices)
    selectedIndices = shuffled.slice(0, 15) as number[]
  } else {
    // 边界情况：题目池本身小于15道题
    selectedIndices = [...availableIndices]
    const allIndices = pool.map((_, idx) => idx)
    while (selectedIndices.length < 15) {
      const randomIdx = Math.floor(Math.random() * totalQuestions)
      selectedIndices.push(allIndices[randomIdx] as number)
    }
  }
  
  // 更新已使用的索引
  selectionState.usedIndices = [...selectionState.usedIndices, ...selectedIndices]
  saveSelectionState()
  
  // 根据选中的索引获取题目
  const selected = selectedIndices
    .map(idx => pool[idx])
    .filter((s): s is typeof pool[0] => s !== undefined)
  
  return selected.map((sentence, index) => {
    const targetWord = sentence.targetWord
    const originalEnding = sentence.originalEnding
    const baseWord = originalEnding !== '' && targetWord.endsWith(originalEnding) 
      ? targetWord.slice(0, -originalEnding.length) 
      : targetWord
    
    let correctAnswer: string
    let options: string[]
    
    if (sentence.correctFullWord) {
      correctAnswer = sentence.correctFullWord
      options = sentence.possibleEndings
    } else {
      correctAnswer = baseWord + sentence.correctEnding
      options = sentence.possibleEndings.map(ending => baseWord + ending)
    }
    
    const uniqueOptions = [...new Set(options)]
    
    // 更可靠的方法：先清理句子中的任何HTML标签
    let processedText = sentence.text
    processedText = processedText.replace(/<[^>]*>/g, '')
    
    // 找到目标词的位置并添加蓝色样式
    const targetIndex = processedText.indexOf(targetWord)
    if (targetIndex !== -1) {
      const before = processedText.slice(0, targetIndex)
      const after = processedText.slice(targetIndex + targetWord.length)
      processedText = before + `<span style="color: #3498db;">${targetWord}</span>` + after
    }
    
    return {
      id: index + 1,
      text: processedText,
      targetWord: sentence.targetWord,
      options: uniqueOptions,
      correctAnswer: uniqueOptions.indexOf(correctAnswer) >= 0 ? uniqueOptions.indexOf(correctAnswer) : 0,
      explanation: sentence.explanation
    }
  })
}

// 格式化倒计时为 mm:ss 格式
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// 开始倒计时
const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    testTimeLeft.value--
    if (testTimeLeft.value <= 0) {
      stopTimer()
      submitTest()
    }
  }, 1000)
}

// 停止倒计时
const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// 重置测试状态
const resetTestState = () => {
  stopTimer()
  testTimeLeft.value = 180
  testState.value = 'ongoing'
  currentQuestionIndex.value = 0
  userAnswers.value = new Array(15).fill(-1)
  selectedAnswer.value = -1
  testShowResult.value = false
  testScore.value = 0
  isLastQuestionAnswered.value = false
  showTestSummary.value = false
  testQuestions.value = generateTestQuestions()
  startTimer()
}

// 选择答案
const chooseAnswer = (index: number) => {
  const isFirstTime = userAnswers.value[currentQuestionIndex.value] === -1
  selectedAnswer.value = index
  userAnswers.value[currentQuestionIndex.value] = index
  
  if (currentQuestionIndex.value < 14) {
    testNextQuestion()
  } else if (currentQuestionIndex.value === 14 && (isFirstTime || !isLastQuestionAnswered.value)) {
    isLastQuestionAnswered.value = true
    submitTest()
  }
}

// 下一题
const testNextQuestion = () => {
  if (currentQuestionIndex.value < testQuestions.value.length - 1) {
    currentQuestionIndex.value++
    selectedAnswer.value = userAnswers.value[currentQuestionIndex.value] || -1
    testShowResult.value = false
  }
}

// 上一题
const testPrevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    selectedAnswer.value = userAnswers.value[currentQuestionIndex.value] || -1
    testShowResult.value = false
  }
}

// 提交测试
const submitTest = () => {
  stopTimer()
  // 计算分数
  let score = 0
  for (let i = 0; i < userAnswers.value.length; i++) {
    const question = testQuestions.value[i]
    if (question && userAnswers.value[i] === question.correctAnswer) {
      score++
    }
  }
  testScore.value = score
  testState.value = 'completed'
  showTestSummary.value = true
  currentQuestionIndex.value = 0
  localStorage.removeItem('russianDeclensionTestProgress')
  
  // 保存测试历史到trainingHistory
  const testHistory = {
    id: Date.now(),
    type: '测试',
    date: new Date().toLocaleString('zh-CN'),
    correct: score,
    total: userAnswers.value.length,
    score: Math.round((score / userAnswers.value.length) * 100),
    userAnswers: [...userAnswers.value],
    questions: [...testQuestions.value]
  }
  trainingHistory.value.unshift(testHistory)
  saveTrainingHistory()
}

// 跳转到指定题目
const goToQuestion = (index: number) => {
  currentQuestionIndex.value = index
  selectedAnswer.value = userAnswers.value[index] || -1
  showTestSummary.value = false
}

// 查看历史测试详情
const viewHistoryDetails = (history: any) => {
  // 导航到测试页面
  currentPage.value = 'test'
  
  // 加载历史答题情况
  if (history.userAnswers && history.questions) {
    testState.value = 'completed'
    userAnswers.value = history.userAnswers
    testQuestions.value = history.questions
    testScore.value = history.correct
    testShowResult.value = true
    currentQuestionIndex.value = 0
  }
}

// 定义训练历史项的类型
interface TrainingHistoryItem {
  id: number
  type: string
  case?: string
  date: string
  correct: number
  total: number
  score: number
  userAnswers?: number[]
  questions?: any[]
}

// 清空全部测试历史
const clearAllHistory = () => {
  if (confirm('确定要清空全部测试历史吗？此操作不可恢复。')) {
    trainingHistory.value = trainingHistory.value.filter((item: TrainingHistoryItem) => item.type !== '测试')
    saveTrainingHistory()
  }
}

// 删除单个测试历史
const deleteHistory = (id: number) => {
  if (confirm('确定要删除这条测试历史吗？此操作不可恢复。')) {
    trainingHistory.value = trainingHistory.value.filter((item: TrainingHistoryItem) => item.id !== id)
    saveTrainingHistory()
  }
}

// 重新开始测试
const restartTest = () => {
  resetTestState()
}

// 变格规则页面折叠状态（移动端）
const expandedCases = reactive({
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
  6: false
} as Record<number, boolean>)

// 电脑端当前选中的格
const selectedDesktopCase = ref<number | null>(null)

// 切换变格规则折叠状态
const toggleCaseExpansion = (caseNumber: number) => {
  const isDesktop = window.innerWidth >= 768
  if (isDesktop) {
    // 电脑端：切换选中状态
    if (selectedDesktopCase.value === caseNumber) {
      selectedDesktopCase.value = null
    } else {
      selectedDesktopCase.value = caseNumber
    }
    // 让右侧内容滚动到顶部
    nextTick(() => {
      const rulesContent = document.querySelector('.rules-content') as HTMLElement
      if (rulesContent) {
        rulesContent.scrollTop = 0
      }
    })
  } else {
    // 移动端：保持原有切换逻辑
    expandedCases[caseNumber] = !expandedCases[caseNumber]
  }
}

// 从本地存储加载训练历史
const loadTrainingHistory = () => {
  const savedHistory = localStorage.getItem('russianDeclensionTrainingHistory')
  if (savedHistory) {
    try {
      return JSON.parse(savedHistory)
    } catch (error) {
      console.error('Failed to load training history:', error)
    }
  }
  // 默认训练历史为空
  return []
}

// 保存训练历史到本地存储
const saveTrainingHistory = () => {
  localStorage.setItem('russianDeclensionTrainingHistory', JSON.stringify(trainingHistory.value))
}

// 个人中心相关状态
const trainingHistory = ref(loadTrainingHistory())

// 选择格
const selectCase = (caseNumber: number) => {
  selectedCase.value = caseNumber
  caseTrainingState.value = 'practice'
  usedPracticeSentences.value = [] // 切换格时重置已使用的题目列表
  selectedEnding.value = ''
  showDropdown.value = false
  answerResult.value = null
  showResult.value = false
  loadPracticeSentence()
}

// 返回到格选择
const backToCaseSelect = () => {
  caseTrainingState.value = 'select-case'
  selectedCase.value = null
  usedPracticeSentences.value = [] // 返回到格选择时重置已使用的题目列表
  resetPracticeState()
}

// 重置实战训练状态
const resetPracticeState = () => {
  selectedEnding.value = ''
  showDropdown.value = false
  answerResult.value = null
  showResult.value = false
}

// 加载实战训练句子
const loadPracticeSentence = () => {
  // 重置当前题目的状态，但不重置已使用的题目列表
  selectedEnding.value = ''
  showDropdown.value = false
  answerResult.value = null
  showResult.value = false
  
  // 根据选择的格加载不同的句子
  if (selectedCase.value === 1) {
    // 1格（复数）训练题目库
    const case1Sentences = [
      // ========== 情况①：变格时单词末尾字母不变，直接在词尾添加成分 ==========
      {
        id: 1,
        text: 'В классе учатся студент.',
        targetWord: 'студент',
        originalEnding: '',
        correctEnding: 'ы',
        possibleEndings: ['', 'ы', 'и', 'а'],
        explanation: 'студент 是阳性硬干名词，复数加 -ы。',
        pluralCase1Type: 'append'
      },
      {
        id: 2,
        text: 'Её брат — школьники.',
        targetWord: 'брат',
        originalEnding: '',
        correctEnding: 'ья',
        possibleEndings: ['', 'ья', 'ы', 'а'],
        explanation: 'брат 阳性，复数加 -ья。',
        pluralCase1Type: 'append'
      },
      {
        id: 3,
        text: 'В этом доме живут сосед.',
        targetWord: 'сосед',
        originalEnding: '',
        correctEnding: 'и',
        possibleEndings: ['', 'и', 'ы', 'а'],
        explanation: 'сосед 阳性，复数加 -и。',
        pluralCase1Type: 'append'
      },
      {
        id: 4,
        text: 'На праздник пришли муж с жёнами.',
        targetWord: 'муж',
        originalEnding: '',
        correctEnding: 'ья',
        possibleEndings: ['', 'ья', 'ы', 'а'],
        explanation: 'муж 阳性，复数加 -ья。',
        pluralCase1Type: 'append'
      },
      {
        id: 5,
        text: 'У Ивана сын уже взрослые.',
        targetWord: 'сын',
        originalEnding: '',
        correctEnding: 'овья',
        possibleEndings: ['', 'овья', 'ы', 'а'],
        explanation: 'сын 阳性，复数加 -овья。',
        pluralCase1Type: 'append'
      },
      {
        id: 6,
        text: 'На кухне стоят стол.',
        targetWord: 'стол',
        originalEnding: '',
        correctEnding: 'ы',
        possibleEndings: ['', 'ы', 'и', 'а'],
        explanation: 'стол 阳性非动物，复数加 -ы。',
        pluralCase1Type: 'append'
      },
      {
        id: 7,
        text: 'В комнате стул сломаны.',
        targetWord: 'стул',
        originalEnding: '',
        correctEnding: 'ья',
        possibleEndings: ['', 'ья', 'ы', 'а'],
        explanation: 'стул 阳性，复数加 -ья。',
        pluralCase1Type: 'append'
      },
      {
        id: 8,
        text: 'Новые дом построены в центре.',
        targetWord: 'дом',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'и'],
        explanation: 'дом 阳性，复数加 -а。',
        pluralCase1Type: 'append'
      },
      {
        id: 9,
        text: 'В России есть большие город.',
        targetWord: 'город',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'и'],
        explanation: 'город 阳性，复数加 -а。',
        pluralCase1Type: 'append'
      },
      {
        id: 10,
        text: 'Зелёные лес окружают озеро.',
        targetWord: 'лес',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'и'],
        explanation: 'лес 阳性，复数加 -а。',
        pluralCase1Type: 'append'
      },
      {
        id: 11,
        text: 'У кошки зелёные глаз.',
        targetWord: 'глаз',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'и'],
        explanation: 'глаз 阳性，复数加 -а。',
        pluralCase1Type: 'append'
      },
      {
        id: 12,
        text: 'Его зуб белые.',
        targetWord: 'зуб',
        originalEnding: '',
        correctEnding: 'ы',
        possibleEndings: ['', 'ы', 'и', 'а'],
        explanation: 'зуб 阳性，复数加 -ы。',
        pluralCase1Type: 'append'
      },
      {
        id: 13,
        text: 'Осенью лист желтеют.',
        targetWord: 'лист',
        originalEnding: '',
        correctEnding: 'ья',
        possibleEndings: ['', 'ья', 'ы', 'а'],
        explanation: 'лист（树叶）阳性，复数加 -ья。',
        pluralCase1Type: 'append'
      },
      {
        id: 14,
        text: 'На вокзале стоят поезд.',
        targetWord: 'поезд',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'и'],
        explanation: 'поезд 阳性，复数加 -а。',
        pluralCase1Type: 'append'
      },
      {
        id: 15,
        text: 'На конверте написаны адрес.',
        targetWord: 'адрес',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'и'],
        explanation: 'адрес 阳性，复数加 -а。',
        pluralCase1Type: 'append'
      },
      {
        id: 16,
        text: 'На столе лежат паспорт.',
        targetWord: 'паспорт',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'и'],
        explanation: 'паспорт 阳性，复数加 -а。',
        pluralCase1Type: 'append'
      },
      {
        id: 17,
        text: 'В гостинице свободные номер.',
        targetWord: 'номер',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'и'],
        explanation: 'номер 阳性，复数加 -а。',
        pluralCase1Type: 'append'
      },

      // ========== 情况②：变格时需要改变末尾字母，但其他部分不改变 ==========
      {
        id: 19,
        text: 'Наши учитель строгие.',
        targetWord: 'учитель',
        originalEnding: 'ь',
        correctEnding: 'я',
        possibleEndings: ['ь', 'я', 'и', 'ы'],
        explanation: 'учитель 阳性，词尾 -ь 变 -я。',
        pluralCase1Type: 'replace'
      },
      {
        id: 20,
        text: 'В этом доме большие окно.',
        targetWord: 'окно',
        originalEnding: 'о',
        correctEnding: 'а',
        possibleEndings: ['о', 'а', 'ы', 'и'],
        explanation: 'окно 中性，词尾 -о 变 -а。',
        pluralCase1Type: 'replace'
      },
      {
        id: 21,
        text: 'Чёрное и Средиземное море тёплые.',
        targetWord: 'море',
        originalEnding: 'е',
        correctEnding: 'я',
        possibleEndings: ['е', 'я', 'ы', 'а'],
        explanation: 'море 中性，词尾 -е 变 -я。',
        pluralCase1Type: 'replace'
      },
      {
        id: 22,
        text: 'В саду растут яблоко.',
        targetWord: 'яблоко',
        originalEnding: 'о',
        correctEnding: 'и',
        possibleEndings: ['о', 'и', 'а', 'ы'],
        explanation: 'яблоко 中性，词尾 -о 变 -и。',
        pluralCase1Type: 'replace'
      },
      {
        id: 23,
        text: 'У спортсмена широкие плечо.',
        targetWord: 'плечо',
        originalEnding: 'о',
        correctEnding: 'и',
        possibleEndings: ['о', 'и', 'а', 'ы'],
        explanation: 'плечо 中性，词尾 -о 变 -и。',
        pluralCase1Type: 'replace'
      },
      {
        id: 24,
        text: 'У ребёнка болят колено.',
        targetWord: 'колено',
        originalEnding: 'о',
        correctEnding: 'и',
        possibleEndings: ['о', 'и', 'а', 'ы'],
        explanation: 'колено 中性，词尾 -о 变 -и。',
        pluralCase1Type: 'replace'
      },
      {
        id: 25,
        text: 'На полке стоят книга.',
        targetWord: 'книга',
        originalEnding: 'а',
        correctEnding: 'и',
        possibleEndings: ['а', 'и', 'ы', 'ов'],
        explanation: 'книга 阴性，词尾 -а 变 -и。',
        pluralCase1Type: 'replace'
      },
      {
        id: 26,
        text: 'В магазине продаются тетрадь.',
        targetWord: 'тетрадь',
        originalEnding: 'ь',
        correctEnding: 'и',
        possibleEndings: ['ь', 'и', 'ы', 'и'],
        explanation: 'тетрадь 阴性，词尾 -ь 变 -и。',
        pluralCase1Type: 'replace'
      },
      {
        id: 27,
        text: 'У неё хорошие подруга.',
        targetWord: 'подруга',
        originalEnding: 'а',
        correctEnding: 'и',
        possibleEndings: ['а', 'и', 'ы', 'ов'],
        explanation: 'подруга 阴性，词尾 -а 变 -и。',
        pluralCase1Type: 'replace'
      },
      {
        id: 28,
        text: 'У музыканта ловкие рука.',
        targetWord: 'рука',
        originalEnding: 'а',
        correctEnding: 'и',
        possibleEndings: ['а', 'и', 'ы', 'ов'],
        explanation: 'рука 阴性，词尾 -а 变 -и。',
        pluralCase1Type: 'replace'
      },
      {
        id: 29,
        text: 'У неё красивые нога.',
        targetWord: 'нога',
        originalEnding: 'а',
        correctEnding: 'и',
        possibleEndings: ['а', 'и', 'ы', 'ов'],
        explanation: 'нога 阴性，词尾 -а 变 -и。',
        pluralCase1Type: 'replace'
      },
      {
        id: 30,
        text: 'У всех голова болят от шума.',
        targetWord: 'голова',
        originalEnding: 'а',
        correctEnding: 'ы',
        possibleEndings: ['а', 'ы', 'и', 'ов'],
        explanation: 'голова 阴性，词尾 -а 变 -ы。',
        pluralCase1Type: 'replace'
      },

      // ========== 情况③：变格时需要改变末尾字母，且其他部分也改变 ==========
      {
        id: 31,
        text: 'В парке высокие дерево.',
        targetWord: 'дерево',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'деревья',
        possibleEndings: ['дерево', 'деревы', 'деревья', 'деревьи'],
        explanation: 'дерево 中性，复数 деревья（特殊变格）。',
        pluralCase1Type: 'full'
      },
      {
        id: 32,
        text: 'Мои друг любят спорт.',
        targetWord: 'друг',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'друзья',
        possibleEndings: ['друг', 'други', 'другие', 'друзья'],
        explanation: '名词 друг（阳性，动物）的复数形式为 друзья，属于特殊变格。',
        pluralCase1Type: 'full'
      },
      {
        id: 33,
        text: 'В парке гуляют ребёнок.',
        targetWord: 'ребёнок',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'дети',
        possibleEndings: ['ребёнок', 'ребята', 'ребёнки', 'дети'],
        explanation: 'ребёнок 阳性，复数由另一词干构成 дети（特殊形式，需记忆）。',
        pluralCase1Type: 'full'
      },
      {
        id: 34,
        text: 'У слона большие ухо.',
        targetWord: 'ухо',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'уши',
        possibleEndings: ['ухо', 'ухи', 'уха', 'уши'],
        explanation: 'ухо 中性，复数 уши（特殊变格，辅音交替）。',
        pluralCase1Type: 'full'
      },
      {
        id: 35,
        text: 'На картинах художника изображены небо разных цветов.',
        targetWord: 'небо',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'небеса',
        possibleEndings: ['небо', 'неба', 'небы', 'небеса'],
        explanation: 'небо 中性，复数 небеса（特殊变格）。',
        pluralCase1Type: 'full'
      },
      {
        id: 36,
        text: 'Эти чудо известны всем.',
        targetWord: 'чудо',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'чудеса',
        possibleEndings: ['чудо', 'чуда', 'чуды', 'чудеса'],
        explanation: 'чудо 中性，复数 чудеса（特殊变格）。',
        pluralCase1Type: 'full'
      },
      {
        id: 37,
        text: 'Тяжёлые время настали.',
        targetWord: 'время',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'времена',
        possibleEndings: ['время', 'времен', 'времены', 'времена'],
        explanation: 'время 中性（特殊变格），复数 времена。',
        pluralCase1Type: 'full'
      },
      {
        id: 38,
        text: 'В списке написаны имя.',
        targetWord: 'имя',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'имена',
        possibleEndings: ['имя', 'имена', 'имены', 'имена'],
        explanation: 'имя 中性（特殊变格），复数 имена。',
        pluralCase1Type: 'full'
      },
      {
        id: 39,
        text: 'На праздник пришли мать с детьми.',
        targetWord: 'мать',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'матери',
        possibleEndings: ['мать', 'маты', 'матья', 'матери'],
        explanation: 'мать 阴性（特殊变格），复数 матери。',
        pluralCase1Type: 'full'
      },
      {
        id: 40,
        text: 'Её дочь уже взрослые.',
        targetWord: 'дочь',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'дочери',
        possibleEndings: ['дочь', 'доче', 'дочьи', 'дочери'],
        explanation: 'дочь 阴性（特殊变格），复数 дочери。',
        pluralCase1Type: 'full'
      },
      {
        id: 41,
        text: 'Мои сестра учатся в школе.',
        targetWord: 'сестра',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'сёстры',
        possibleEndings: ['сестра', 'сестры', 'сестри', 'сёстры'],
        explanation: 'сестра 阴性，复数 сёстры（元音交替）。',
        pluralCase1Type: 'full'
      }
    ]
    // 过滤出未使用的题目（基于targetWord而不是ID，确保不会出现重复的单词）
    const availableSentences = case1Sentences.filter((sentence: any) => !usedPracticeSentences.value.includes(sentence.id))
    
    // 如果所有题目都用完了，重置已使用的题目列表
    if (availableSentences.length === 0) {
      usedPracticeSentences.value = []
      availableSentences.push(...case1Sentences)
    }
    
    // 随机选择一个未使用的句子
    const randomIndex = Math.floor(Math.random() * availableSentences.length)
    const selectedSentence = availableSentences[randomIndex]
    
    if (!selectedSentence) {
      // 如果没有可用的句子，重置并重新加载
      usedPracticeSentences.value = []
      loadPracticeSentence()
      return
    }
    
    // 记录已使用的题目ID
    usedPracticeSentences.value.push(selectedSentence.id)
    
    practiceSentence.value = selectedSentence as PracticeSentence
  } else if (selectedCase.value === 2) {
    // 2格（属格）训练题目库
    const case2Sentences = [
      // ========== 情况①：直接在单词后面添加词缀 ==========
      {
        id: 1,
        text: 'У этого стол четыре ножки.',
        targetWord: 'стол',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'у'],
        explanation: 'стол 阳性，二格直接加 -а。',
        case2Type: 'append'
      },
      {
        id: 2,
        text: 'Около этого дом растёт дерево.',
        targetWord: 'дом',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'у'],
        explanation: 'дом 阳性，二格直接加 -а。',
        case2Type: 'append'
      },
      {
        id: 3,
        text: 'Мы ждём автобус из этого город.',
        targetWord: 'город',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'у'],
        explanation: 'город 阳性，二格直接加 -а。',
        case2Type: 'append'
      },
      {
        id: 4,
        text: 'До этого год остался месяц.',
        targetWord: 'год',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'у'],
        explanation: 'год 阳性，二格直接加 -а。',
        case2Type: 'append'
      },
      {
        id: 5,
        text: 'У этого друг есть машина.',
        targetWord: 'друг',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'у'],
        explanation: 'друг 阳性，二格直接加 -а。',
        case2Type: 'append'
      },
      {
        id: 6,
        text: 'Без этого кот мы скучаем.',
        targetWord: 'кот',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'у'],
        explanation: 'кот 阳性，二格直接加 -а。',
        case2Type: 'append'
      },
      {
        id: 7,
        text: 'У этого студент хорошие оценки.',
        targetWord: 'студент',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'у'],
        explanation: 'студент 阳性，二格直接加 -а。',
        case2Type: 'append'
      },
      {
        id: 8,
        text: 'Я старше брат.',
        targetWord: 'брат',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['', 'а', 'ы', 'у'],
        explanation: 'брат 阳性，二格直接加 -а。',
        case2Type: 'append'
      },
      
      // ========== 情况②：需要改变末尾字母 ==========
      {
        id: 9,
        text: 'После долгого путь мы отдохнули.',
        targetWord: 'путь',
        originalEnding: 'ь',
        correctEnding: 'и',
        possibleEndings: ['ь', 'и', 'ы', 'у'],
        explanation: 'путь 阳性，词尾 -ь 变 -и。',
        case2Type: 'replace'
      },
      {
        id: 10,
        text: 'Для этого учитель это важно.',
        targetWord: 'учитель',
        originalEnding: 'ь',
        correctEnding: 'я',
        possibleEndings: ['ь', 'я', 'и', 'ы'],
        explanation: 'учитель 阳性，词尾 -ь 变 -я。',
        case2Type: 'replace'
      },
      {
        id: 11,
        text: 'В комнате много столы.',
        targetWord: 'столы',
        originalEnding: 'ы',
        correctEnding: 'ов',
        possibleEndings: ['ы', 'ов', 'ам', 'ами'],
        explanation: 'столы 复数，词尾 -ы 变 -ов。',
        case2Type: 'replace'
      },
      {
        id: 12,
        text: 'На улице много дома.',
        targetWord: 'дома',
        originalEnding: 'а',
        correctEnding: 'ов',
        possibleEndings: ['а', 'ов', 'ам', 'ами'],
        explanation: 'дома 复数，词尾 -а 变 -ов。',
        case2Type: 'replace'
      },
      {
        id: 13,
        text: 'В этой стране много города.',
        targetWord: 'города',
        originalEnding: 'а',
        correctEnding: 'ов',
        possibleEndings: ['а', 'ов', 'ам', 'ами'],
        explanation: 'города 复数，词尾 -а 变 -ов。',
        case2Type: 'replace'
      },
      {
        id: 14,
        text: 'У меня нет часы.',
        targetWord: 'часы',
        originalEnding: 'ы',
        correctEnding: 'ов',
        possibleEndings: ['ы', 'ов', 'ам', 'ами'],
        explanation: 'часы 复数，词尾 -ы 变 -ов。',
        case2Type: 'replace'
      },
      {
        id: 15,
        text: 'У нас много пути.',
        targetWord: 'пути',
        originalEnding: 'и',
        correctEnding: 'ей',
        possibleEndings: ['и', 'ей', 'ям', 'ями'],
        explanation: 'пути 复数，词尾 -и 变 -ей。',
        case2Type: 'replace'
      },
      {
        id: 16,
        text: 'В зале много люди.',
        targetWord: 'люди',
        originalEnding: 'и',
        correctEnding: 'ей',
        possibleEndings: ['и', 'ей', 'ям', 'ями'],
        explanation: 'люди 复数，词尾 -и 变 -ей。',
        case2Type: 'replace'
      },
      {
        id: 17,
        text: 'У меня много друзья.',
        targetWord: 'друзья',
        originalEnding: 'зья',
        correctEnding: 'зей',
        possibleEndings: ['зья', 'зей', 'ям', 'ями'],
        explanation: 'друзья 复数，词尾 -ья 变 -ей。',
        case2Type: 'replace'
      },
      {
        id: 18,
        text: 'Во дворе много коты.',
        targetWord: 'коты',
        originalEnding: 'ы',
        correctEnding: 'ов',
        possibleEndings: ['ы', 'ов', 'ам', 'ами'],
        explanation: 'коты 复数，词尾 -ы 变 -ов。',
        case2Type: 'replace'
      },
      {
        id: 19,
        text: 'В школе нет учителя.',
        targetWord: 'учителя',
        originalEnding: 'я',
        correctEnding: 'ей',
        possibleEndings: ['я', 'ей', 'ям', 'ями'],
        explanation: 'учителя 复数，词尾 -я 变 -ей。',
        case2Type: 'replace'
      },
      {
        id: 20,
        text: 'У неё пять братья.',
        targetWord: 'братья',
        originalEnding: 'ья',
        correctEnding: 'ев',
        possibleEndings: ['ья', 'ев', 'ям', 'ями'],
        explanation: 'братья 复数，词尾 -ья 变 -ев。',
        case2Type: 'replace'
      },
      {
        id: 21,
        text: 'У этого окно разбито стекло.',
        targetWord: 'окно',
        originalEnding: 'о',
        correctEnding: 'а',
        possibleEndings: ['о', 'а', 'у', 'ом'],
        explanation: 'окно 中性，词尾 -о 变 -а。',
        case2Type: 'replace'
      },
      {
        id: 22,
        text: 'Для этого письмо нужен конверт.',
        targetWord: 'письмо',
        originalEnding: 'о',
        correctEnding: 'а',
        possibleEndings: ['о', 'а', 'у', 'ом'],
        explanation: 'письмо 中性，词尾 -о 变 -а。',
        case2Type: 'replace'
      },
      {
        id: 23,
        text: 'У меня нет время.',
        targetWord: 'время',
        originalEnding: 'мя',
        correctEnding: 'мени',
        possibleEndings: ['мя', 'мени', 'мю', 'мем'],
        explanation: 'время 中性，词尾 -мя 变 -мени。',
        case2Type: 'replace'
      },
      {
        id: 24,
        text: 'В зале нет свободного место.',
        targetWord: 'место',
        originalEnding: 'о',
        correctEnding: 'а',
        possibleEndings: ['о', 'а', 'у', 'ом'],
        explanation: 'место 中性，词尾 -о 变 -а。',
        case2Type: 'replace'
      },
      {
        id: 25,
        text: 'Мы отдыхали у море.',
        targetWord: 'море',
        originalEnding: 'е',
        correctEnding: 'я',
        possibleEndings: ['е', 'я', 'у', 'ем'],
        explanation: 'море 中性，词尾 -е 变 -я。',
        case2Type: 'replace'
      },
      {
        id: 26,
        text: 'У этого животное острые зубы.',
        targetWord: 'животное',
        originalEnding: 'ое',
        correctEnding: 'ого',
        possibleEndings: ['ое', 'ого', 'ому', 'ым'],
        explanation: 'животное 中性，词尾 -ое 变 -ого。',
        case2Type: 'replace'
      },
      {
        id: 27,
        text: 'В лесу много животные.',
        targetWord: 'животные',
        originalEnding: 'ые',
        correctEnding: 'ых',
        possibleEndings: ['ые', 'ых', 'ым', 'ыми'],
        explanation: 'животные 复数，词尾 -ые 变 -ых。',
        case2Type: 'replace'
      },
      {
        id: 28,
        text: 'У этой книга красивая обложка.',
        targetWord: 'книга',
        originalEnding: 'га',
        correctEnding: 'ги',
        possibleEndings: ['га', 'ги', 'ге', 'гу'],
        explanation: 'книга 阴性，词尾 -а 变 -и。',
        case2Type: 'replace'
      },
      {
        id: 29,
        text: 'Около этой дверь стоит стул.',
        targetWord: 'дверь',
        originalEnding: 'ь',
        correctEnding: 'и',
        possibleEndings: ['ь', 'и', 'е', 'ю'],
        explanation: 'дверь 阴性，词尾 -ь 变 -и。',
        case2Type: 'replace'
      },
      {
        id: 30,
        text: 'Из этой комната вышел человек.',
        targetWord: 'комната',
        originalEnding: 'а',
        correctEnding: 'ы',
        possibleEndings: ['а', 'ы', 'е', 'у'],
        explanation: 'комната 阴性，词尾 -а 变 -ы。',
        case2Type: 'replace'
      },
      {
        id: 31,
        text: 'В бутылке нет холодной вода.',
        targetWord: 'вода',
        originalEnding: 'а',
        correctEnding: 'ы',
        possibleEndings: ['а', 'ы', 'е', 'у'],
        explanation: 'вода 阴性，词尾 -а 变 -ы。',
        case2Type: 'replace'
      },
      {
        id: 32,
        text: 'У этой семья трое детей.',
        targetWord: 'семья',
        originalEnding: 'я',
        correctEnding: 'и',
        possibleEndings: ['я', 'и', 'е', 'ю'],
        explanation: 'семья 阴性，词尾 -я 变 -и。',
        case2Type: 'replace'
      },
      {
        id: 33,
        text: 'У этой женщина красивые глаза.',
        targetWord: 'женщина',
        originalEnding: 'а',
        correctEnding: 'ы',
        possibleEndings: ['а', 'ы', 'е', 'у'],
        explanation: 'женщина 阴性，词尾 -а 变 -ы。',
        case2Type: 'replace'
      },
      {
        id: 34,
        text: 'Без этой девушка мне грустно.',
        targetWord: 'девушка',
        originalEnding: 'а',
        correctEnding: 'и',
        possibleEndings: ['а', 'и', 'е', 'у'],
        explanation: 'девушка 阴性，词尾 -а 变 -и。',
        case2Type: 'replace'
      },
      {
        id: 35,
        text: 'У моей бабушки нет такой кошка.',
        targetWord: 'кошка',
        originalEnding: 'а',
        correctEnding: 'и',
        possibleEndings: ['а', 'и', 'е', 'у'],
        explanation: 'кошка 阴性，词尾 -а 变 -и。',
        case2Type: 'replace'
      },
      {
        id: 36,
        text: 'У этой лошадь красивая грива.',
        targetWord: 'лошадь',
        originalEnding: 'ь',
        correctEnding: 'и',
        possibleEndings: ['ь', 'и', 'е', 'ю'],
        explanation: 'лошадь 阴性，词尾 -ь 变 -и。',
        case2Type: 'replace'
      },
      {
        id: 37,
        text: 'Мы боимся мышь.',
        targetWord: 'мышь',
        originalEnding: 'ь',
        correctEnding: 'и',
        possibleEndings: ['ь', 'и', 'е', 'ю'],
        explanation: 'мышь 阴性，词尾 -ь 变 -и。',
        case2Type: 'replace'
      },
      {
        id: 38,
        text: 'В этом доме нет деревянных двери.',
        targetWord: 'двери',
        originalEnding: 'и',
        correctEnding: 'ей',
        possibleEndings: ['и', 'ей', 'ям', 'ями'],
        explanation: 'двери 复数，词尾 -и 变 -ей。',
        case2Type: 'replace'
      },
      {
        id: 39,
        text: 'В этом районе много семьи.',
        targetWord: 'семьи',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'семей',
        possibleEndings: ['семьи', 'семей', 'семьям', 'семьями'],
        explanation: 'семьи 复数，词尾消失且移动元音（特殊变格）。',
        case2Type: 'full'
      },
      {
        id: 40,
        text: 'На ферме много лошади.',
        targetWord: 'лошади',
        originalEnding: 'и',
        correctEnding: 'ей',
        possibleEndings: ['и', 'ей', 'ям', 'ями'],
        explanation: 'лошади 复数，词尾 -и 变 -ей。',
        case2Type: 'replace'
      },
      
      // ========== 情况③：出现词尾消失现象，但没有移动元音 ==========
      {
        id: 41,
        text: 'На полке много книги.',
        targetWord: 'книги',
        originalEnding: 'и',
        correctEnding: '/',
        possibleEndings: ['и', '/', 'ам', 'ами'],
        explanation: 'книги 复数，词尾消失（没有移动元音）。',
        case2Type: 'clear'
      },
      {
        id: 42,
        text: 'В квартире пять комнаты.',
        targetWord: 'комнаты',
        originalEnding: 'ы',
        correctEnding: '/',
        possibleEndings: ['ы', '/', 'ам', 'ами'],
        explanation: 'комнаты 复数，词尾消失（没有移动元音）。',
        case2Type: 'clear'
      },
      {
        id: 43,
        text: 'В городе много улицы.',
        targetWord: 'улицы',
        originalEnding: 'ы',
        correctEnding: '/',
        possibleEndings: ['ы', '/', 'ам', 'ами'],
        explanation: 'улицы 复数，词尾消失（没有移动元音）。',
        case2Type: 'clear'
      },
      {
        id: 44,
        text: 'На концерте было много женщины.',
        targetWord: 'женщины',
        originalEnding: 'ы',
        correctEnding: '/',
        possibleEndings: ['ы', '/', 'ам', 'ами'],
        explanation: 'женщины 复数，词尾消失（没有移动元音）。',
        case2Type: 'clear'
      },
      {
        id: 45,
        text: 'У неё пять собаки.',
        targetWord: 'собаки',
        originalEnding: 'и',
        correctEnding: '/',
        possibleEndings: ['и', '/', 'ам', 'ами'],
        explanation: 'собаки 复数，词尾消失（没有移动元音）。',
        case2Type: 'clear'
      },
      
      // ========== 情况④：出现词尾消失现象，且移动元音 ==========
      {
        id: 46,
        text: 'В доме много окна.',
        targetWord: 'окна',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'окон',
        possibleEndings: ['окна', 'окон', 'окнам', 'окнами'],
        explanation: 'окна 复数，词尾消失且移动元音（特殊变格）。',
        case2Type: 'full'
      },
      {
        id: 47,
        text: 'У меня нет новых письма.',
        targetWord: 'письма',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'писем',
        possibleEndings: ['письма', 'писем', 'письмам', 'письмами'],
        explanation: 'письма 复数，词尾消失且移动元音（特殊变格）。',
        case2Type: 'full'
      },
      {
        id: 48,
        text: 'После трудных времена наступает радость.',
        targetWord: 'времена',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'времён',
        possibleEndings: ['времена', 'времён', 'временам', 'временами'],
        explanation: 'времена 复数，词尾消失且移动元音（特殊变格）。',
        case2Type: 'full'
      },
      {
        id: 49,
        text: 'В этом районе много семьи.',
        targetWord: 'семьи',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'семей',
        possibleEndings: ['семьи', 'семей', 'семьям', 'семьями'],
        explanation: 'семьи 复数，词尾消失且移动元音（特殊变格）。',
        case2Type: 'full'
      },
      {
        id: 50,
        text: 'В парке нет девушки.',
        targetWord: 'девушки',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'девушек',
        possibleEndings: ['девушки', 'девушек', 'девушкам', 'девушками'],
        explanation: 'девушки 复数，词尾消失且移动元音（特殊变格）。',
        case2Type: 'full'
      },
      {
        id: 51,
        text: 'Во дворе несколько кошки.',
        targetWord: 'кошки',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'кошек',
        possibleEndings: ['кошки', 'кошек', 'кошкам', 'кошками'],
        explanation: 'кошки 复数，词尾消失且移动元音（特殊变格）。',
        case2Type: 'full'
      }
    ]
    // 过滤出未使用的题目
    const availableSentences = case2Sentences.filter((sentence: any) => !usedPracticeSentences.value.includes(sentence.id))
    
    // 如果所有题目都用完了，重置已使用的题目列表
    if (availableSentences.length === 0) {
      usedPracticeSentences.value = []
      availableSentences.push(...case2Sentences)
    }
    
    // 随机选择一个未使用的句子
    const randomIndex = Math.floor(Math.random() * availableSentences.length)
    const selectedSentence = availableSentences[randomIndex]
    
    if (!selectedSentence) {
      // 如果没有可用的句子，重置并重新加载
      usedPracticeSentences.value = []
      loadPracticeSentence()
      return
    }
    
    // 记录已使用的题目ID
    usedPracticeSentences.value.push(selectedSentence.id)
    
    practiceSentence.value = selectedSentence as PracticeSentence
  } else if (selectedCase.value === 3) {
    // 3格（与格）训练题目库
    const case3Sentences = [
      // 情况①：直接在词尾添加词缀
      {
        id: 1,
        text: 'Я даю книгу <strong>друг</strong>.',
        targetWord: 'друг',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'друг 阳性名词，第三格加-у → другу。',
        case3Type: 'append'
      },
      {
        id: 2,
        text: 'Мы идём к <strong>врач</strong>.',
        targetWord: 'врач',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'врач 阳性名词，第三格加-у → врачу。',
        case3Type: 'append'
      },
      {
        id: 3,
        text: 'Учитель объясняет урок <strong>ученик</strong>.',
        targetWord: 'ученик',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'ученик 阳性名词，第三格加-у → ученику。',
        case3Type: 'append'
      },
      {
        id: 4,
        text: 'Я посылаю сообщение <strong>брат</strong>.',
        targetWord: 'брат',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'брат 阳性名词，第三格加-у → брату。',
        case3Type: 'append'
      },
      {
        id: 5,
        text: 'Он рад <strong>подарок</strong>.',
        targetWord: 'подарок',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'подарку',
        possibleEndings: ['подарку', 'подарка', 'подарком', 'подарке'],
        explanation: 'подарок 阳性名词，变格时词尾变化 → подарку。',
        case3Type: 'full'
      },
      {
        id: 6,
        text: 'Мне нужно позвонить <strong>отец</strong>.',
        targetWord: 'отец',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'отцу',
        possibleEndings: ['отцу', 'отца', 'отцом', 'отце'],
        explanation: 'отец 阳性名词，变格时词尾变化 → отцу。',
        case3Type: 'full'
      },
      {
        id: 7,
        text: 'Мы готовимся к <strong>экзамен</strong>.',
        targetWord: 'экзамен',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'экзамен 阳性名词，第三格加-у → экзамену。',
        case3Type: 'append'
      },
      {
        id: 8,
        text: 'Я советую <strong>студент</strong> читать книгу.',
        targetWord: 'студент',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'студент 阳性名词，第三格加-у → студенту。',
        case3Type: 'append'
      },
      {
        id: 9,
        text: 'Он учится русскому <strong>язык</strong>.',
        targetWord: 'язык',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'язык 阳性名词，第三格加-у → языку。',
        case3Type: 'append'
      },
      {
        id: 10,
        text: 'Он мешает <strong>сосед</strong>.',
        targetWord: 'сосед',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'сосед 阳性名词，第三格加-у → соседу。',
        case3Type: 'append'
      },
      {
        id: 11,
        text: 'Кошка идёт к <strong>хозяин</strong>.',
        targetWord: 'хозяин',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'хозяин 阳性名词，第三格加-у → хозяину。',
        case3Type: 'append'
      },
      {
        id: 12,
        text: 'Дети радуются <strong>праздник</strong>.',
        targetWord: 'праздник',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'праздник 阳性名词，第三格加-у → празднику。',
        case3Type: 'append'
      },
      {
        id: 13,
        text: 'Он звонит <strong>товарищ</strong>.',
        targetWord: 'товарищ',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'товарищ 阳性名词，第三格加-у → товарищу。',
        case3Type: 'append'
      },
      {
        id: 14,
        text: 'Мы пишем сочинение по <strong>план</strong>.',
        targetWord: 'план',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'план 阳性名词，第三格加-у → плану。',
        case3Type: 'append'
      },
      {
        id: 15,
        text: 'Я купил подарок <strong>сын</strong>.',
        targetWord: 'сын',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'сын 阳性名词，第三格加-у → сыну。',
        case3Type: 'append'
      },
      {
        id: 16,
        text: 'Студенты готовятся к <strong>зачёт</strong>.',
        targetWord: 'зачёт',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'зачёт 阳性名词，第三格加-у → зачёту。',
        case3Type: 'append'
      },
      {
        id: 17,
        text: 'Я послал письмо <strong>директор</strong>.',
        targetWord: 'директор',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'директор 阳性名词，第三格加-у → директору。',
        case3Type: 'append'
      },
      {
        id: 18,
        text: 'Мы гуляем по <strong>парк</strong>.',
        targetWord: 'парк',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'парк 阳性名词，第三格加-у → парку。',
        case3Type: 'append'
      },
      {
        id: 19,
        text: 'Мы следуем <strong>совет</strong> врача.',
        targetWord: 'совет',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'совет 阳性名词，第三格加-у → совету。',
        case3Type: 'append'
      },
      {
        id: 20,
        text: 'Он завидует <strong>приятель</strong>.',
        targetWord: 'приятель',
        originalEnding: 'ь',
        correctEnding: 'ю',
        possibleEndings: ['ю', 'у', 'ам', 'ям'],
        explanation: 'приятель 阳性名词，词尾-ь→-ю → приятелю。',
        case3Type: 'replace'
      },
      {
        id: 21,
        text: 'Я обещаю <strong>знакомый</strong> помочь.',
        targetWord: 'знакомый',
        originalEnding: 'ый',
        correctEnding: 'ому',
        possibleEndings: ['ому', 'ому', 'ам', 'ям'],
        explanation: 'знакомый 形容词化名词，第三格→знакомому。',
        case3Type: 'replace'
      },
      {
        id: 22,
        text: 'Мы верим <strong>дети</strong>.',
        targetWord: 'дети',
        originalEnding: 'и',
        correctEnding: 'ям',
        possibleEndings: ['ям', 'ам', 'у', 'ю'],
        explanation: 'дети 复数，词尾-и→-ям → детям。',
        case3Type: 'replace'
      },
      {
        id: 23,
        text: 'Я пишу письмо <strong>родители</strong>.',
        targetWord: 'родители',
        originalEnding: 'и',
        correctEnding: 'ям',
        possibleEndings: ['ям', 'ам', 'у', 'ю'],
        explanation: 'родители 复数，词尾-и→-ям → родителям。',
        case3Type: 'replace'
      },
      {
        id: 24,
        text: 'Он показывает город <strong>туристы</strong>.',
        targetWord: 'туристы',
        originalEnding: 'ы',
        correctEnding: 'ам',
        possibleEndings: ['ам', 'ям', 'у', 'ю'],
        explanation: 'туристы 复数，词尾-ы→-ам → туристам。',
        case3Type: 'replace'
      },
      {
        id: 25,
        text: 'Он помогает <strong>родственники</strong>.',
        targetWord: 'родственники',
        originalEnding: 'и',
        correctEnding: 'ам',
        possibleEndings: ['ам', 'ям', 'у', 'ю'],
        explanation: 'родственники 复数，词尾-и→-ам → родственникам。',
        case3Type: 'replace'
      },
      {
        id: 26,
        text: 'Мы сочувствуем <strong>пострадавшие</strong>.',
        targetWord: 'пострадавшие',
        originalEnding: 'ие',
        correctEnding: 'им',
        possibleEndings: ['им', 'ам', 'ям', 'у'],
        explanation: 'пострадавшие 形容词化名词复数，词尾-ие→-им → пострадавшим。',
        case3Type: 'replace'
      },
      {
        id: 27,
        text: 'Дети рады <strong>яблоки</strong>.',
        targetWord: 'яблоки',
        originalEnding: 'и',
        correctEnding: 'ам',
        possibleEndings: ['ам', 'ям', 'у', 'ю'],
        explanation: 'яблоки 复数，词尾-и→-ам → яблокам。',
        case3Type: 'replace'
      },
      // 情况②：需要改变末尾字母的
      {
        id: 28,
        text: 'Он помогает <strong>сестра</strong>.',
        targetWord: 'сестра',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'сестра 阴性名词，词尾-а→-е → сестре。',
        case3Type: 'replace'
      },
      {
        id: 29,
        text: 'Дети пишут письмо <strong>бабушка</strong>.',
        targetWord: 'бабушка',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'бабушка 阴性名词，词尾-а→-е → бабушке。',
        case3Type: 'replace'
      },
      {
        id: 30,
        text: 'Я звоню <strong>мама</strong>.',
        targetWord: 'мама',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'мама 阴性名词，词尾-а→-е → маме。',
        case3Type: 'replace'
      },
      {
        id: 31,
        text: 'Кот бежит к <strong>мышь</strong>.',
        targetWord: 'мышь',
        originalEnding: 'ь',
        correctEnding: 'и',
        possibleEndings: ['и', 'ю', 'у', 'е'],
        explanation: 'мышь 阴性名词，词尾-ь→-и → мыши。',
        case3Type: 'replace'
      },
      {
        id: 32,
        text: 'Она покупает подарок <strong>подруга</strong>.',
        targetWord: 'подруга',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'подруга 阴性名词，词尾-а→-е → подруге。',
        case3Type: 'replace'
      },
      {
        id: 33,
        text: 'Мы гуляем по <strong>улица</strong>.',
        targetWord: 'улица',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'улица 阴性名词，词尾-а→-е → улице。',
        case3Type: 'replace'
      },
      {
        id: 34,
        text: 'Дети идут к <strong>учительница</strong>.',
        targetWord: 'учительница',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'учительница 阴性名词，词尾-а→-е → учительнице。',
        case3Type: 'replace'
      },
      {
        id: 35,
        text: 'Я помогаю <strong>дедушка</strong>.',
        targetWord: 'дедушка',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'дедушка 阳性名词（按阴性变），词尾-а→-е → дедушке。',
        case3Type: 'replace'
      },
      {
        id: 36,
        text: 'Студенты отвечают <strong>преподаватель</strong>.',
        targetWord: 'преподаватель',
        originalEnding: 'ь',
        correctEnding: 'ю',
        possibleEndings: ['ю', 'у', 'и', 'е'],
        explanation: 'преподаватель 阳性名词，词尾-ь→-ю → преподавателю。',
        case3Type: 'replace'
      },
      {
        id: 37,
        text: 'Мы идём по <strong>поле</strong>.',
        targetWord: 'поле',
        originalEnding: 'е',
        correctEnding: 'ю',
        possibleEndings: ['ю', 'у', 'а', 'ом'],
        explanation: 'поле 中性名词，词尾-е→-ю → полю。',
        case3Type: 'replace'
      },
      {
        id: 38,
        text: 'Мы идём к <strong>море</strong>.',
        targetWord: 'море',
        originalEnding: 'е',
        correctEnding: 'ю',
        possibleEndings: ['ю', 'у', 'а', 'ом'],
        explanation: 'море 中性名词，词尾-е→-ю → морю。',
        case3Type: 'replace'
      },
      {
        id: 39,
        text: 'Я дарю цветы <strong>девушка</strong>.',
        targetWord: 'девушка',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'девушка 阴性名词，词尾-а→-е → девушке。',
        case3Type: 'replace'
      },
      {
        id: 40,
        text: 'Котёнок бежит к <strong>папа</strong>.',
        targetWord: 'папа',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'папа 阳性名词（按阴性变），词尾-а→-е → папе。',
        case3Type: 'replace'
      },
      {
        id: 41,
        text: 'Учительница даёт задание <strong>ученицы</strong>.',
        targetWord: 'ученицы',
        originalEnding: 'ы',
        correctEnding: 'ам',
        possibleEndings: ['ам', 'ям', 'у', 'ю'],
        explanation: 'ученицы 复数，词尾-ы→-ам → ученицам。',
        case3Type: 'replace'
      },
      {
        id: 42,
        text: 'Я объясняю правило <strong>коллега</strong>.',
        targetWord: 'коллега',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'коллега 阳性名词（按阴性变），词尾-а→-е → коллеге。',
        case3Type: 'replace'
      },
      {
        id: 43,
        text: 'Дети бегут к <strong>река</strong>.',
        targetWord: 'река',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'река 阴性名词，词尾-а→-е → реке。',
        case3Type: 'replace'
      },
      {
        id: 44,
        text: 'Мы рады <strong>встреча</strong>.',
        targetWord: 'встреча',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'встреча 阴性名词，词尾-а→-е → встрече。',
        case3Type: 'replace'
      },
      {
        id: 45,
        text: 'Я звоню <strong>дочь</strong> вечером.',
        targetWord: 'дочь',
        originalEnding: 'ь',
        correctEnding: 'ери',
        possibleEndings: ['ери', 'ю', 'и', 'е'],
        explanation: 'дочь 阴性名词，特殊变格 → дочери。',
        case3Type: 'replace'
      },
      {
        id: 46,
        text: 'Кошка подошла к <strong>миска</strong>.',
        targetWord: 'миска',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'миска 阴性名词，词尾-а→-е → миске。',
        case3Type: 'replace'
      },
      {
        id: 47,
        text: 'Она учит детей <strong>музыка</strong>.',
        targetWord: 'музыка',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'музыка 阴性名词，词尾-а→-е → музыке。',
        case3Type: 'replace'
      },
      {
        id: 48,
        text: 'Он верит <strong>правда</strong>.',
        targetWord: 'правда',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'правда 阴性名词，词尾-а→-е → правде。',
        case3Type: 'replace'
      },
      {
        id: 49,
        text: 'Я удивляюсь <strong>красота</strong> природы.',
        targetWord: 'красота',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'у', 'ы', 'ой'],
        explanation: 'красота 阴性名词，词尾-а→-е → красоте。',
        case3Type: 'replace'
      },
      {
        id: 50,
        text: 'Мы подошли к <strong>здание</strong>.',
        targetWord: 'здание',
        originalEnding: 'е',
        correctEnding: 'ю',
        possibleEndings: ['ю', 'у', 'а', 'ом'],
        explanation: 'здание 中性名词，词尾-е→-ю → зданию。',
        case3Type: 'replace'
      }
    ]
    // 过滤出未使用的题目
    const availableSentences = case3Sentences.filter((sentence: any) => !usedPracticeSentences.value.includes(sentence.id))
    
    // 如果所有题目都用完了，重置已使用的题目列表
    if (availableSentences.length === 0) {
      usedPracticeSentences.value = []
      availableSentences.push(...case3Sentences)
    }
    
    // 随机选择一个未使用的句子
    const randomIndex = Math.floor(Math.random() * availableSentences.length)
    const selectedSentence = availableSentences[randomIndex]
    
    if (!selectedSentence) {
      // 如果没有可用的句子，重置并重新加载
      usedPracticeSentences.value = []
      loadPracticeSentence()
      return
    }
    
    // 记录已使用的题目ID
    usedPracticeSentences.value.push(selectedSentence.id)
    
    practiceSentence.value = selectedSentence as PracticeSentence
  } else if (selectedCase.value === 4) {
    // 4格（宾格）训练题目库
    const case4Sentences = [
      // 情况①：变4格时，直接添加新字母的
      {
        id: 1,
        text: 'Он любит <strong>друг</strong>.',
        targetWord: 'друг',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['а', 'у', 'ом', 'е'],
        explanation: 'друг 阳性动物名词，第四格直接加-а → друга。',
        case4Type: 'append'
      },
      {
        id: 2,
        text: 'Я вижу <strong>брат</strong>.',
        targetWord: 'брат',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['а', 'у', 'ом', 'е'],
        explanation: 'брат 阳性动物名词，第四格直接加-а → брата。',
        case4Type: 'append'
      },
      {
        id: 3,
        text: 'Она ждёт <strong>сын</strong>.',
        targetWord: 'сын',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['а', 'у', 'ом', 'е'],
        explanation: 'сын 阳性动物名词，第四格直接加-а → сына。',
        case4Type: 'append'
      },
      {
        id: 4,
        text: 'Ты видишь <strong>кот</strong>?',
        targetWord: 'кот',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['а', 'у', 'ом', 'е'],
        explanation: 'кот 阳性动物名词，第四格直接加-а → кота。',
        case4Type: 'append'
      },
      {
        id: 5,
        text: 'Мы знаем <strong>студент</strong>.',
        targetWord: 'студент',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['а', 'у', 'ом', 'е'],
        explanation: 'студент 阳性动物名词，第四格直接加-а → студента。',
        case4Type: 'append'
      },
      {
        id: 6,
        text: 'Они слушают <strong>врач</strong>.',
        targetWord: 'врач',
        originalEnding: '',
        correctEnding: 'а',
        possibleEndings: ['а', 'у', 'ом', 'е'],
        explanation: 'врач 阳性动物名词，第四格直接加-а → врача。',
        case4Type: 'append'
      },
      // 情况②：变4格时，只需要改变末尾字母，且其他部分不变的
      {
        id: 7,
        text: 'Студенты отвечают <strong>преподаватель</strong>.',
        targetWord: 'преподаватель',
        originalEnding: 'ь',
        correctEnding: 'я',
        possibleEndings: ['я', 'ю', 'и', 'е'],
        explanation: 'преподаватель 阳性动物名词，词尾-ь→-я → преподавателя。',
        case4Type: 'replace'
      },
      {
        id: 8,
        text: 'Ученики слушают <strong>учитель</strong>.',
        targetWord: 'учитель',
        originalEnding: 'ь',
        correctEnding: 'я',
        possibleEndings: ['я', 'ю', 'и', 'е'],
        explanation: 'учитель 阳性动物名词，词尾-ь→-я → учителя。',
        case4Type: 'replace'
      },
      {
        id: 9,
        text: 'Он любит <strong>сестра</strong>.',
        targetWord: 'сестра',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'сестра 阴性名词，词尾-а→-у → сестру。',
        case4Type: 'replace'
      },
      {
        id: 10,
        text: 'Ты любишь <strong>мама</strong>?',
        targetWord: 'мама',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'мама 阴性名词，词尾-а→-у → маму。',
        case4Type: 'replace'
      },
      {
        id: 11,
        text: 'Мы помним <strong>бабушка</strong>.',
        targetWord: 'бабушка',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'бабушка 阴性名词，词尾-а→-у → бабушку。',
        case4Type: 'replace'
      },
      {
        id: 12,
        text: 'Она ждёт <strong>девушка</strong>.',
        targetWord: 'девушка',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'девушка 阴性名词，词尾-а→-у → девушку。',
        case4Type: 'replace'
      },
      {
        id: 13,
        text: 'Ты видишь <strong>кошка</strong>?',
        targetWord: 'кошка',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'кошка 阴性名词，词尾-а→-у → кошку。',
        case4Type: 'replace'
      },
      {
        id: 14,
        text: 'Они видят <strong>собака</strong>.',
        targetWord: 'собака',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'собака 阴性名词，词尾-а→-у → собаку。',
        case4Type: 'replace'
      },
      {
        id: 15,
        text: 'Я читаю <strong>книга</strong>.',
        targetWord: 'книга',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'книга 阴性名词，词尾-а→-у → книгу。',
        case4Type: 'replace'
      },
      {
        id: 16,
        text: 'Ты пишешь <strong>ручка</strong>?',
        targetWord: 'ручка',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'ручка 阴性名词，词尾-а→-у → ручку。',
        case4Type: 'replace'
      },
      {
        id: 17,
        text: 'Мы убираем <strong>комната</strong>.',
        targetWord: 'комната',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'комната 阴性名词，词尾-а→-у → комнату。',
        case4Type: 'replace'
      },
      {
        id: 18,
        text: 'Она чистит <strong>машина</strong>.',
        targetWord: 'машина',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'машина 阴性名词，词尾-а→-у → машину。',
        case4Type: 'replace'
      },
      {
        id: 19,
        text: 'Ты любишь <strong>работа</strong>?',
        targetWord: 'работа',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'работа 阴性名词，词尾-а→-у → работу。',
        case4Type: 'replace'
      },
      {
        id: 20,
        text: 'Мы идём в <strong>школа</strong>.',
        targetWord: 'школа',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'школа 阴性名词，词尾-а→-у → школу。',
        case4Type: 'replace'
      },
      {
        id: 21,
        text: 'Он видит <strong>подруга</strong>.',
        targetWord: 'подруга',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'подруга 阴性名词，词尾-а→-у → подругу。',
        case4Type: 'replace'
      },
      {
        id: 22,
        text: 'Ученики слушают <strong>учительница</strong>.',
        targetWord: 'учительница',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'учительница 阴性名词，词尾-а→-у → учительницу。',
        case4Type: 'replace'
      },
      {
        id: 23,
        text: 'Ты любишь <strong>жена</strong>?',
        targetWord: 'жена',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'жена 阴性名词，词尾-а→-у → жену。',
        case4Type: 'replace'
      },
      {
        id: 24,
        text: 'Она читает <strong>газета</strong>.',
        targetWord: 'газета',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'газета 阴性名词，词尾-а→-у → газету。',
        case4Type: 'replace'
      },
      {
        id: 25,
        text: 'Мы моем <strong>посуда</strong>.',
        targetWord: 'посуда',
        originalEnding: 'а',
        correctEnding: 'у',
        possibleEndings: ['у', 'ы', 'е', 'ой'],
        explanation: 'посуда 阴性名词，词尾-а→-у → посуду。',
        case4Type: 'replace'
      },
      {
        id: 26,
        text: 'Оно любит <strong>животное</strong>.',
        targetWord: 'животное',
        originalEnding: 'ое',
        correctEnding: 'ого',
        possibleEndings: ['ого', 'ому', 'ое', 'ым'],
        explanation: 'животное 中性动物名词，词尾-ое→-ого → животного。',
        case4Type: 'replace'
      },
      {
        id: 27,
        text: 'Ты видишь <strong>насекомое</strong>?',
        targetWord: 'насекомое',
        originalEnding: 'ое',
        correctEnding: 'ого',
        possibleEndings: ['ого', 'ому', 'ое', 'ым'],
        explanation: 'насекомое 中性动物名词，词尾-ое→-ого → насекомого。',
        case4Type: 'replace'
      },
      {
        id: 28,
        text: 'Они знают <strong>студенты</strong>.',
        targetWord: 'студенты',
        originalEnding: 'ы',
        correctEnding: 'ов',
        possibleEndings: ['ов', 'ам', 'ах', 'ами'],
        explanation: 'студенты 阳性动物名词复数，词尾-ы→-ов → студентов。',
        case4Type: 'replace'
      },
      // 情况③：变4格时，不仅需要改变末尾字母，且其他部分也有字母改变的
      {
        id: 29,
        text: 'Ты видишь <strong>отец</strong>?',
        targetWord: 'отец',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'отца',
        possibleEndings: ['отца', 'отцу', 'отцом', 'отце'],
        explanation: 'отец 阳性动物名词，变格时词尾变化 → отца。',
        case4Type: 'full'
      },
      {
        id: 30,
        text: 'Он любит <strong>пёс</strong>.',
        targetWord: 'пёс',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'пса',
        possibleEndings: ['пса', 'псу', 'псом', 'псе'],
        explanation: 'пёс 阳性动物名词，变格时词尾变化 → пса。',
        case4Type: 'full'
      },
      {
        id: 31,
        text: 'Мы знаем <strong>заяц</strong>.',
        targetWord: 'заяц',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'зайца',
        possibleEndings: ['зайца', 'зайцу', 'зайцем', 'зайце'],
        explanation: 'заяц 阳性动物名词，变格时词尾变化 → зайца。',
        case4Type: 'full'
      },
      {
        id: 32,
        text: 'Ты любишь <strong>друзья</strong>?',
        targetWord: 'друзья',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'друзей',
        possibleEndings: ['друзей', 'друзьям', 'друзьями', 'друзьях'],
        explanation: 'друзья 阳性动物名词复数，变格时词尾变化 → друзей。',
        case4Type: 'full'
      },
      {
        id: 33,
        text: 'Он любит <strong>братья</strong>?',
        targetWord: 'братья',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'братьев',
        possibleEndings: ['братьев', 'братьям', 'братьями', 'братьях'],
        explanation: 'братья 阳性动物名词复数，变格时词尾变化 → братьев。',
        case4Type: 'full'
      },
      {
        id: 34,
        text: 'Ты любишь <strong>сёстры</strong>?',
        targetWord: 'сёстры',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'сестёр',
        possibleEndings: ['сестёр', 'сёстрам', 'сёстрами', 'сёстрах'],
        explanation: 'сёстры 阴性动物名词复数，变格时词尾变化 → сестёр。',
        case4Type: 'full'
      },
      {
        id: 35,
        text: 'Ты видишь <strong>кошки</strong>?',
        targetWord: 'кошки',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'кошек',
        possibleEndings: ['кошек', 'кошкам', 'кошками', 'кошках'],
        explanation: 'кошки 阴性动物名词复数，变格时词尾变化 → кошек。',
        case4Type: 'full'
      },
      {
        id: 36,
        text: 'Он любит <strong>девушки</strong>?',
        targetWord: 'девушки',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'девушек',
        possibleEndings: ['девушек', 'девушкам', 'девушками', 'девушках'],
        explanation: 'девушки 阴性动物名词复数，变格时词尾变化 → девушек。',
        case4Type: 'full'
      },
      // 情况④：变4格时，不需要变位的（保持不变的）
      {
        id: 37,
        text: 'Ты видишь <strong>стол</strong>?',
        targetWord: 'стол',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'стол 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 38,
        text: 'Он видит <strong>дом</strong>.',
        targetWord: 'дом',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'дом 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 39,
        text: 'Мы живём в <strong>город</strong>.',
        targetWord: 'город',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'город 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 40,
        text: 'Ты едешь на <strong>автобус</strong>?',
        targetWord: 'автобус',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'автобус 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 41,
        text: 'Он разговаривает по <strong>телефон</strong>.',
        targetWord: 'телефон',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'телефон 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 42,
        text: 'Он читает <strong>роман</strong>.',
        targetWord: 'роман',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'роман 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 43,
        text: 'Художник рисует <strong>портрет</strong>.',
        targetWord: 'портрет',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'портрет 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 44,
        text: 'Спортсмен играет в <strong>футбол</strong>.',
        targetWord: 'футбол',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'футбол 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 45,
        text: 'Мама готовит <strong>суп</strong>.',
        targetWord: 'суп',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'суп 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 46,
        text: 'Они едят <strong>обед</strong>.',
        targetWord: 'обед',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'обед 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 47,
        text: 'Папа читает <strong>журнал</strong>.',
        targetWord: 'журнал',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'журнал 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 48,
        text: 'Ты купил <strong>компьютер</strong>?',
        targetWord: 'компьютер',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'компьютер 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 49,
        text: 'Он сидит на <strong>стул</strong>.',
        targetWord: 'стул',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'стул 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 50,
        text: 'Ты видишь <strong>окно</strong>?',
        targetWord: 'окно',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'окно 中性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 51,
        text: 'Ты ешь <strong>яблоко</strong>?',
        targetWord: 'яблоко',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'яблоко 中性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 52,
        text: 'У нас есть <strong>время</strong>.',
        targetWord: 'время',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'мени', 'мю', 'мем'],
        explanation: 'время 中性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 53,
        text: 'Ты знаешь <strong>имя</strong>?',
        targetWord: 'имя',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'имени', 'имю', 'имем'],
        explanation: 'имя 中性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 54,
        text: 'Он пишет <strong>письмо</strong>.',
        targetWord: 'письмо',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'письмо 中性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 55,
        text: 'Мы строим <strong>здание</strong>.',
        targetWord: 'здание',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ия', 'ию', 'ием'],
        explanation: 'здание 中性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 56,
        text: 'Они ищут <strong>место</strong>.',
        targetWord: 'место',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'место 中性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 57,
        text: 'Он едет на <strong>лошадь</strong>.',
        targetWord: 'лошадь',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ди', 'дью', 'де'],
        explanation: 'лошадь 阴性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 58,
        text: 'Ты видишь <strong>мышь</strong>?',
        targetWord: 'мышь',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ши', 'шью', 'ше'],
        explanation: 'мышь 阴性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 59,
        text: 'Мы помним <strong>мать</strong>.',
        targetWord: 'мать',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ти', 'тью', 'те'],
        explanation: 'мать 阴性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 60,
        text: 'Ты любишь <strong>дочь</strong>?',
        targetWord: 'дочь',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ти', 'тью', 'те'],
        explanation: 'дочь 阴性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 61,
        text: 'Ты закрываешь <strong>дверь</strong>?',
        targetWord: 'дверь',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ри', 'рью', 'ре'],
        explanation: 'дверь 阴性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 62,
        text: 'Она открывает <strong>тетрадь</strong>.',
        targetWord: 'тетрадь',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ди', 'дью', 'де'],
        explanation: 'тетрадь 阴性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 63,
        text: 'Ты видишь <strong>столы</strong>?',
        targetWord: 'столы',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ов', 'ам', 'ах'],
        explanation: 'столы 阳性非动物名词复数，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 64,
        text: 'Мы строим <strong>дома</strong>.',
        targetWord: 'дома',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ов', 'ам', 'ах'],
        explanation: 'дома 阳性非动物名词复数，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 65,
        text: 'Ты купил <strong>телефоны</strong>?',
        targetWord: 'телефоны',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ов', 'ам', 'ах'],
        explanation: 'телефоны 阳性非动物名词复数，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 66,
        text: 'Ты читаешь <strong>книги</strong>?',
        targetWord: 'книги',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'г', 'гам', 'гах'],
        explanation: 'книги 阴性非动物名词复数，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 67,
        text: 'Она чистит <strong>машины</strong>.',
        targetWord: 'машины',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'н', 'нам', 'нах'],
        explanation: 'машины 阴性非动物名词复数，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 68,
        text: 'Ты видишь <strong>окна</strong>?',
        targetWord: 'окна',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'н', 'нам', 'нах'],
        explanation: 'окна 中性非动物名词复数，第四格不变。',
        case4Type: 'nochange'
      }
    ]
    // 过滤出未使用的题目
    const availableSentences = case4Sentences.filter((sentence: any) => !usedPracticeSentences.value.includes(sentence.id))
    
    // 如果所有题目都用完了，重置已使用的题目列表
    if (availableSentences.length === 0) {
      usedPracticeSentences.value = []
      availableSentences.push(...case4Sentences)
    }
    
    // 随机选择一个未使用的句子
    const randomIndex = Math.floor(Math.random() * availableSentences.length)
    const selectedSentence = availableSentences[randomIndex]
    
    if (!selectedSentence) {
      // 如果没有可用的句子，重置并重新加载
      usedPracticeSentences.value = []
      loadPracticeSentence()
      return
    }
    
    // 记录已使用的题目ID
    usedPracticeSentences.value.push(selectedSentence.id)
    
    practiceSentence.value = selectedSentence as PracticeSentence
  } else if (selectedCase.value === 5) {
    // 5格（工具格）训练题目库
    const case5Sentences = [
      {
        id: 1,
        text: 'Он доволен <strong>стол</strong>.',
        targetWord: 'стол',
        originalEnding: '',
        correctEnding: 'ом',
        possibleEndings: ['ом', 'а', 'у', 'е'],
        explanation: 'стол 阳性名词，工具格直接加 -ом → столом。',
        case5Type: 'append'
      },
      {
        id: 2,
        text: 'Мы гордимся <strong>дом</strong>.',
        targetWord: 'дом',
        originalEnding: '',
        correctEnding: 'ом',
        possibleEndings: ['ом', 'а', 'у', 'е'],
        explanation: 'дом 阳性名词，工具格直接加 -ом → домом。',
        case5Type: 'append'
      },
      {
        id: 3,
        text: 'Он рисует <strong>карандаш</strong>.',
        targetWord: 'карандаш',
        originalEnding: '',
        correctEnding: 'ом',
        possibleEndings: ['ом', 'а', 'ем', 'у'],
        explanation: 'карандаш 阳性名词，工具格直接加 -ом → карандашом。',
        case5Type: 'append'
      },
      {
        id: 4,
        text: 'Я пользуюсь <strong>телефон</strong>.',
        targetWord: 'телефон',
        originalEnding: '',
        correctEnding: 'ом',
        possibleEndings: ['ом', 'а', 'у', 'е'],
        explanation: 'телефон 阳性名词，工具格直接加 -ом → телефоном。',
        case5Type: 'append'
      },
      {
        id: 5,
        text: 'Студент пользуется <strong>учебник</strong>.',
        targetWord: 'учебник',
        originalEnding: '',
        correctEnding: 'ом',
        possibleEndings: ['ом', 'а', 'у', 'е'],
        explanation: 'учебник 阳性名词，工具格直接加 -ом → учебником。',
        case5Type: 'append'
      },
      {
        id: 6,
        text: 'Он наслаждается <strong>чай</strong>.',
        targetWord: 'чай',
        originalEnding: '',
        correctEnding: 'ем',
        possibleEndings: ['ем', 'я', 'ю', 'ом'],
        explanation: 'чай 阳性名词，工具格直接加 -ем → чаем。',
        case5Type: 'append'
      },
      {
        id: 7,
        text: 'Он ест суп с <strong>хлеб</strong>.',
        targetWord: 'хлеб',
        originalEnding: '',
        correctEnding: 'ом',
        possibleEndings: ['ом', 'а', 'у', 'е'],
        explanation: 'хлеб 阳性名词，工具格直接加 -ом → хлебом。',
        case5Type: 'append'
      },
      {
        id: 8,
        text: 'Я иду в кино с <strong>друг</strong>.',
        targetWord: 'друг',
        originalEnding: '',
        correctEnding: 'ом',
        possibleEndings: ['ом', 'а', 'у', 'е'],
        explanation: 'друг 阳性名词，工具格直接加 -ом → другом。',
        case5Type: 'append'
      },
      {
        id: 9,
        text: 'Она разговаривает с <strong>брат</strong>.',
        targetWord: 'брат',
        originalEnding: '',
        correctEnding: 'ом',
        possibleEndings: ['ом', 'а', 'у', 'е'],
        explanation: 'брат 阳性名词，工具格直接加 -ом → братом。',
        case5Type: 'append'
      },
      {
        id: 10,
        text: 'Он работает <strong>врач</strong>.',
        targetWord: 'врач',
        originalEnding: '',
        correctEnding: 'ом',
        possibleEndings: ['ом', 'а', 'ем', 'у'],
        explanation: 'врач 阳性名词，工具格直接加 -ом → врачом。',
        case5Type: 'append'
      },
      {
        id: 11,
        text: 'Он стал <strong>студент</strong>.',
        targetWord: 'студент',
        originalEnding: '',
        correctEnding: 'ом',
        possibleEndings: ['ом', 'а', 'у', 'е'],
        explanation: 'студент 阳性名词，工具格直接加 -ом → студентом。',
        case5Type: 'append'
      },
      {
        id: 12,
        text: 'Я познакомился с <strong>сосед</strong>.',
        targetWord: 'сосед',
        originalEnding: '',
        correctEnding: 'ом',
        possibleEndings: ['ом', 'а', 'у', 'е'],
        explanation: 'сосед 阳性名词，工具格直接加 -ом → соседом。',
        case5Type: 'append'
      },
      {
        id: 13,
        text: 'Он любуется <strong>окно</strong>.',
        targetWord: 'окно',
        originalEnding: '',
        correctEnding: 'м',
        possibleEndings: ['м', 'а', 'у', 'е'],
        explanation: 'окно 中性名词，工具格直接加 -м → окном。',
        case5Type: 'append'
      },
      {
        id: 14,
        text: 'Он думает над <strong>слово</strong>.',
        targetWord: 'слово',
        originalEnding: '',
        correctEnding: 'м',
        possibleEndings: ['м', 'а', 'у', 'е'],
        explanation: 'слово 中性名词，工具格直接加 -м → словом。',
        case5Type: 'append'
      },
      {
        id: 15,
        text: 'Он занят <strong>письмо</strong>.',
        targetWord: 'письмо',
        originalEnding: '',
        correctEnding: 'м',
        possibleEndings: ['м', 'а', 'у', 'е'],
        explanation: 'письмо 中性名词，工具格直接加 -м → письмом。',
        case5Type: 'append'
      },
      {
        id: 16,
        text: 'Мы любуемся <strong>море</strong>.',
        targetWord: 'море',
        originalEnding: '',
        correctEnding: 'м',
        possibleEndings: ['м', 'я', 'ю', 'е'],
        explanation: 'море 中性名词，工具格直接加 -м → морем。',
        case5Type: 'append'
      },
      {
        id: 17,
        text: 'Он стоит перед <strong>ворота</strong>.',
        targetWord: 'ворота',
        originalEnding: '',
        correctEnding: 'ми',
        possibleEndings: ['ми', 'в', 'ам', 'ах'],
        explanation: 'ворота 复数名词，工具格直接加 -ми → воротами。',
        case5Type: 'append'
      },
      {
        id: 18,
        text: 'Моя мама работает <strong>учитель</strong>.',
        targetWord: 'учитель',
        originalEnding: 'ь',
        correctEnding: 'ем',
        possibleEndings: ['ем', 'я', 'ю', 'ом'],
        explanation: 'учитель 阳性名词，-ь 变为 -ем → учителем。',
        case5Type: 'replace'
      },
      {
        id: 19,
        text: 'Я интересуюсь <strong>книга</strong>.',
        targetWord: 'книга',
        originalEnding: 'а',
        correctEnding: 'ой',
        possibleEndings: ['ой', 'ы', 'е', 'у'],
        explanation: 'книга 阴性名词，-а 变为 -ой → книгой。',
        case5Type: 'replace'
      },
      {
        id: 20,
        text: 'Он пишет <strong>ручка</strong>.',
        targetWord: 'ручка',
        originalEnding: 'а',
        correctEnding: 'ой',
        possibleEndings: ['ой', 'ы', 'е', 'у'],
        explanation: 'ручка 阴性名词，-а 变为 -ой → ручкой。',
        case5Type: 'replace'
      },
      {
        id: 21,
        text: 'Мы управляем <strong>машина</strong>.',
        targetWord: 'машина',
        originalEnding: 'а',
        correctEnding: 'ой',
        possibleEndings: ['ой', 'ы', 'е', 'у'],
        explanation: 'машина 阴性名词，-а 变为 -ой → машиной。',
        case5Type: 'replace'
      },
      {
        id: 22,
        text: 'Она гордится <strong>школа</strong>.',
        targetWord: 'школа',
        originalEnding: 'а',
        correctEnding: 'ой',
        possibleEndings: ['ой', 'ы', 'е', 'у'],
        explanation: 'школа 阴性名词，-а 变为 -ой → школой。',
        case5Type: 'replace'
      },
      {
        id: 23,
        text: 'Мы довольны <strong>квартира</strong>.',
        targetWord: 'квартира',
        originalEnding: 'а',
        correctEnding: 'ой',
        possibleEndings: ['ой', 'ы', 'е', 'у'],
        explanation: 'квартира 阴性名词，-а 变为 -ой → квартирой。',
        case5Type: 'replace'
      },
      {
        id: 24,
        text: 'Он моет руки <strong>вода</strong>.',
        targetWord: 'вода',
        originalEnding: 'а',
        correctEnding: 'ой',
        possibleEndings: ['ой', 'ы', 'е', 'у'],
        explanation: 'вода 阴性名词，-а 变为 -ой → водой。',
        case5Type: 'replace'
      },
      {
        id: 25,
        text: 'Он увлекается <strong>музыка</strong>.',
        targetWord: 'музыка',
        originalEnding: 'а',
        correctEnding: 'ой',
        possibleEndings: ['ой', 'ы', 'е', 'у'],
        explanation: 'музыка 阴性名词，-а 变为 -ой → музыкой。',
        case5Type: 'replace'
      },
      {
        id: 26,
        text: 'Я гуляю с <strong>сестра</strong>.',
        targetWord: 'сестра',
        originalEnding: 'а',
        correctEnding: 'ой',
        possibleEndings: ['ой', 'ы', 'е', 'у'],
        explanation: 'сестра 阴性名词，-а 变为 -ой → сестрой。',
        case5Type: 'replace'
      },
      {
        id: 27,
        text: 'Мальчик дружит с <strong>девочка</strong>.',
        targetWord: 'девочка',
        originalEnding: 'а',
        correctEnding: 'ой',
        possibleEndings: ['ой', 'ы', 'е', 'у'],
        explanation: 'девочка 阴性名词，-а 变为 -ой → девочкой。',
        case5Type: 'replace'
      },
      {
        id: 28,
        text: 'Он познакомился с <strong>женщина</strong>.',
        targetWord: 'женщина',
        originalEnding: 'а',
        correctEnding: 'ой',
        possibleEndings: ['ой', 'ы', 'е', 'у'],
        explanation: 'женщина 阴性名词，-а 变为 -ой → женщиной。',
        case5Type: 'replace'
      },
      {
        id: 29,
        text: 'Дети играют с <strong>собака</strong>.',
        targetWord: 'собака',
        originalEnding: 'а',
        correctEnding: 'ой',
        possibleEndings: ['ой', 'ы', 'е', 'у'],
        explanation: 'собака 阴性名词，-а 变为 -ой → собакой。',
        case5Type: 'replace'
      },
      {
        id: 30,
        text: 'Девочка играет с <strong>кошка</strong>.',
        targetWord: 'кошка',
        originalEnding: 'а',
        correctEnding: 'ой',
        possibleEndings: ['ой', 'ы', 'е', 'у'],
        explanation: 'кошка 阴性名词，-а 变为 -ой → кошкой。',
        case5Type: 'replace'
      },
      {
        id: 31,
        text: 'Он платит <strong>деньги</strong>.',
        targetWord: 'деньги',
        originalEnding: 'и',
        correctEnding: 'ами',
        possibleEndings: ['ами', 'г', 'гам', 'гах'],
        explanation: 'деньги 复数名词，-и 变为 -ами → деньгами。',
        case5Type: 'replace'
      },
      {
        id: 32,
        text: 'Он измеряет время <strong>часы</strong>.',
        targetWord: 'часы',
        originalEnding: 'ы',
        correctEnding: 'ами',
        possibleEndings: ['ами', 'сов', 'сам', 'сах'],
        explanation: 'часы 复数名词，-ы 变为 -ами → часами。',
        case5Type: 'replace'
      },
      {
        id: 33,
        text: 'Он пользуется <strong>очки</strong>.',
        targetWord: 'очки',
        originalEnding: 'и',
        correctEnding: 'ами',
        possibleEndings: ['ами', 'к', 'кам', 'ках'],
        explanation: 'очки 复数名词，-и 变为 -ами → очками。',
        case5Type: 'replace'
      },
      {
        id: 34,
        text: 'Она режет бумагу <strong>ножницы</strong>.',
        targetWord: 'ножницы',
        originalEnding: 'ы',
        correctEnding: 'ами',
        possibleEndings: ['ами', 'ц', 'цам', 'цах'],
        explanation: 'ножницы 复数名词，-ы 变为 -ами → ножницами。',
        case5Type: 'replace'
      },
      {
        id: 35,
        text: 'Он доволен <strong>брюки</strong>.',
        targetWord: 'брюки',
        originalEnding: 'и',
        correctEnding: 'ами',
        possibleEndings: ['ами', 'к', 'кам', 'ках'],
        explanation: 'брюки 复数名词，-и 变为 -ами → брюками。',
        case5Type: 'replace'
      },
      {
        id: 36,
        text: 'Он живёт с <strong>отец</strong>.',
        targetWord: 'отец',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'отцом',
        possibleEndings: ['отцом', 'отца', 'отцу', 'отце'],
        explanation: 'отец 阳性名词，变格时 е 脱落 → отцом。',
        case5Type: 'full'
      },
      {
        id: 37,
        text: 'Он говорит с <strong>мать</strong>.',
        targetWord: 'мать',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'матерью',
        possibleEndings: ['матерью', 'матери', 'матери', 'матери'],
        explanation: 'мать 阴性名词，变格时增加 -ер- → матерью。',
        case5Type: 'full'
      },
      {
        id: 38,
        text: 'Она гордится <strong>дочь</strong>.',
        targetWord: 'дочь',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'дочерью',
        possibleEndings: ['дочерью', 'дочери', 'дочери', 'дочери'],
        explanation: 'дочь 阴性名词，变格时增加 -ер- → дочерью。',
        case5Type: 'full'
      },
      {
        id: 39,
        text: 'Он общается с <strong>люди</strong>.',
        targetWord: 'люди',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'людьми',
        possibleEndings: ['людьми', 'людей', 'людям', 'людях'],
        explanation: 'люди 复数名词，词干变化 → людьми。',
        case5Type: 'full'
      },
      {
        id: 40,
        text: 'Она играет с <strong>дети</strong>.',
        targetWord: 'дети',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'детьми',
        possibleEndings: ['детьми', 'детей', 'детям', 'детях'],
        explanation: 'дети 复数名词，词干变化 → детьми。',
        case5Type: 'full'
      }
    ]
    // 过滤出未使用的题目
    const availableSentences = case5Sentences.filter((sentence: any) => !usedPracticeSentences.value.includes(sentence.id))
    
    // 如果所有题目都用完了，重置已使用的题目列表
    if (availableSentences.length === 0) {
      usedPracticeSentences.value = []
      availableSentences.push(...case5Sentences)
    }
    
    // 随机选择一个未使用的句子
    const randomIndex = Math.floor(Math.random() * availableSentences.length)
    const selectedSentence = availableSentences[randomIndex]
    
    if (!selectedSentence) {
      // 如果没有可用的句子，重置并重新加载
      usedPracticeSentences.value = []
      loadPracticeSentence()
      return
    }
    
    // 记录已使用的题目ID
    usedPracticeSentences.value.push(selectedSentence.id)
    
    practiceSentence.value = selectedSentence as PracticeSentence
  } else if (selectedCase.value === 6) {
    // 6格（前置格）训练题目库
    const case6Sentences = [
      // ========== 情况①：直接在词尾添加词缀 ==========
      {
        id: 1,
        text: 'Мы живём в новом <strong>дом</strong>.',
        targetWord: 'дом',
        originalEnding: '',
        correctEnding: 'е',
        possibleEndings: ['е', 'а', 'у', 'ом'],
        explanation: 'дом 阳性名词，前置格直接加 -е → доме。',
        case6Type: 'append'
      },
      {
        id: 2,
        text: 'Они гуляли в густом <strong>лес</strong>.',
        targetWord: 'лес',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'е', 'а', 'ом'],
        explanation: 'лес 阳性名词，前置格特殊形式 -у → лесу。',
        case6Type: 'append'
      },
      {
        id: 3,
        text: 'Дети играют в красивом <strong>сад</strong>.',
        targetWord: 'сад',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'е', 'а', 'ом'],
        explanation: 'сад 阳性名词，前置格特殊形式 -у → саду。',
        case6Type: 'append'
      },
      {
        id: 4,
        text: 'Он встретил меня в международном <strong>аэропорт</strong>.',
        targetWord: 'аэропорт',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'е', 'а', 'ом'],
        explanation: 'аэропорт 阳性名词，前置格直接加 -у → аэропорту。',
        case6Type: 'append'
      },
      {
        id: 5,
        text: 'Это случилось в прошлом <strong>год</strong>.',
        targetWord: 'год',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'е', 'а', 'ом'],
        explanation: 'год 阳性名词，前置格直接加 -у → году。',
        case6Type: 'append'
      },
      {
        id: 6,
        text: 'Он рассказал о том <strong>человек</strong>.',
        targetWord: 'человек',
        originalEnding: '',
        correctEnding: 'е',
        possibleEndings: ['е', 'а', 'у', 'ом'],
        explanation: 'человек 阳性名词，前置格直接加 -е → человеке。',
        case6Type: 'append'
      },
      {
        id: 7,
        text: 'Я часто думаю о моём <strong>друг</strong>.',
        targetWord: 'друг',
        originalEnding: '',
        correctEnding: 'е',
        possibleEndings: ['е', 'а', 'у', 'ом'],
        explanation: 'друг 阳性名词，前置格直接加 -е → друге。',
        case6Type: 'append'
      },
      {
        id: 8,
        text: 'Он заботится о своём <strong>брат</strong>.',
        targetWord: 'брат',
        originalEnding: '',
        correctEnding: 'е',
        possibleEndings: ['е', 'а', 'у', 'ом'],
        explanation: 'брат 阳性名词，前置格直接加 -е → брате。',
        case6Type: 'append'
      },
      {
        id: 9,
        text: 'Они живут в новых <strong>дома</strong>.',
        targetWord: 'дома',
        originalEnding: '',
        correctEnding: 'х',
        possibleEndings: ['х', 'ов', 'ми', 'ом'],
        explanation: 'дом 复数，前置格直接加 -х → домах。',
        case6Type: 'append'
      },
      {
        id: 10,
        text: 'Мы были в разных <strong>города</strong>.',
        targetWord: 'города',
        originalEnding: '',
        correctEnding: 'х',
        possibleEndings: ['х', 'ов', 'ми', 'ом'],
        explanation: 'город 复数，前置格直接加 -х → городах。',
        case6Type: 'append'
      },
      {
        id: 11,
        text: 'Они гуляли в густых <strong>леса</strong>.',
        targetWord: 'леса',
        originalEnding: 'а',
        correctEnding: 'х',
        possibleEndings: ['х', 'ов', 'ми', 'ом'],
        explanation: 'леса 复数，前置格直接变 -ах → лесах。',
        case6Type: 'append'
      },
      {
        id: 12,
        text: 'Он думает о минувших <strong>года</strong>.',
        targetWord: 'года',
        originalEnding: '',
        correctEnding: 'х',
        possibleEndings: ['х', 'ов', 'ми', 'ом'],
        explanation: 'год 复数，前置格直接加 -х → годах。',
        case6Type: 'append'
      },
      {
        id: 13,
        text: 'Мы живём в разных <strong>страна</strong>.',
        targetWord: 'страна',
        originalEnding: '',
        correctEnding: 'х',
        possibleEndings: ['х', 'ов', 'ами', 'ом'],
        explanation: 'страна 复数，前置格直接加 -х → странах。',
        case6Type: 'append'
      },
      {
        id: 14,
        text: 'На старых <strong>улица</strong>.',
        targetWord: 'улица',
        originalEnding: '',
        correctEnding: 'х',
        possibleEndings: ['х', 'ов', 'ами', 'ом'],
        explanation: 'улица 复数，前置格直接加 -х → улицах。',
        case6Type: 'append'
      },
      // ========== 情况②：需要改变末尾字母，但其他部分不改变 ==========
      {
        id: 15,
        text: 'Я нашёл это слово в этом <strong>словарь</strong>.',
        targetWord: 'словарь',
        originalEnding: 'ь',
        correctEnding: 'е',
        possibleEndings: ['е', 'я', 'и', 'ю'],
        explanation: 'словарь -ь 变为 -е → словаре。',
        case6Type: 'replace'
      },
      {
        id: 16,
        text: 'Ошибка в этой <strong>книга</strong>.',
        targetWord: 'книга',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'ы', 'у', 'ю'],
        explanation: 'книга -а 变为 -е → книге。',
        case6Type: 'replace'
      },
      {
        id: 17,
        text: 'Он записал это в синей <strong>тетрадь</strong>.',
        targetWord: 'тетрадь',
        originalEnding: 'ь',
        correctEnding: 'и',
        possibleEndings: ['и', 'е', 'ю', 'я'],
        explanation: 'тетрадь -ь 变为 -и → тетради。',
        case6Type: 'replace'
      },
      {
        id: 18,
        text: 'Надпись на той <strong>дверь</strong>.',
        targetWord: 'дверь',
        originalEnding: 'ь',
        correctEnding: 'и',
        possibleEndings: ['и', 'е', 'ю', 'я'],
        explanation: 'дверь -ь 变为 -и → двери。',
        case6Type: 'replace'
      },
      {
        id: 19,
        text: 'Картина висит на белой <strong>стена</strong>.',
        targetWord: 'стена',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'ы', 'у', 'ю'],
        explanation: 'стена -а 变为 -е → стене。',
        case6Type: 'replace'
      },
      {
        id: 20,
        text: 'Мы гуляли на центральной <strong>улица</strong>.',
        targetWord: 'улица',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'ы', 'у', 'ю'],
        explanation: 'улица -а 变为 -е → улице。',
        case6Type: 'replace'
      },
      {
        id: 21,
        text: 'Они встретились на главной <strong>площадь</strong>.',
        targetWord: 'площадь',
        originalEnding: 'ь',
        correctEnding: 'и',
        possibleEndings: ['и', 'е', 'ю', 'я'],
        explanation: 'площадь -ь 变为 -и → площади。',
        case6Type: 'replace'
      },
      {
        id: 22,
        text: 'Мы купались в холодной <strong>река</strong>.',
        targetWord: 'река',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'ы', 'у', 'ю'],
        explanation: 'река -а 变为 -е → реке。',
        case6Type: 'replace'
      },
      {
        id: 23,
        text: 'Я живу в большой <strong>страна</strong>.',
        targetWord: 'страна',
        originalEnding: 'а',
        correctEnding: 'е',
        possibleEndings: ['е', 'ы', 'у', 'ю'],
        explanation: 'страна -а 变为 -е → стране。',
        case6Type: 'replace'
      },
      {
        id: 24,
        text: 'У него проблемы в его <strong>семья</strong>.',
        targetWord: 'семья',
        originalEnding: 'я',
        correctEnding: 'е',
        possibleEndings: ['е', 'ы', 'и', 'ю'],
        explanation: 'семья -я 变为 -е → семье。',
        case6Type: 'replace'
      },
      {
        id: 25,
        text: 'Ошибка в этом <strong>письмо</strong>.',
        targetWord: 'письмо',
        originalEnding: 'о',
        correctEnding: 'е',
        possibleEndings: ['е', 'а', 'у', 'ом'],
        explanation: 'письмо -о 变为 -е → письме。',
        case6Type: 'replace'
      },
      {
        id: 26,
        text: 'Мы сидели на удобном <strong>место</strong>.',
        targetWord: 'место',
        originalEnding: 'о',
        correctEnding: 'е',
        possibleEndings: ['е', 'а', 'у', 'ом'],
        explanation: 'место -о 变为 -е → месте。',
        case6Type: 'replace'
      },
      {
        id: 27,
        text: 'Мы находимся в высоком <strong>здание</strong>.',
        targetWord: 'здание',
        originalEnding: 'ие',
        correctEnding: 'ии',
        possibleEndings: ['ии', 'ия', 'ием', 'ия'],
        explanation: 'здание -ие 变为 -ии → здании。',
        case6Type: 'replace'
      },
      {
        id: 28,
        text: 'Он искал информацию в этих <strong>книги</strong>.',
        targetWord: 'книги',
        originalEnding: 'и',
        correctEnding: 'ах',
        possibleEndings: ['ах', 'ов', 'ами', 'ой'],
        explanation: 'книга 复数 -и 变为 -ах → книгах。',
        case6Type: 'replace'
      },
      {
        id: 29,
        text: 'Ошибки в этих <strong>тетради</strong>.',
        targetWord: 'тетради',
        originalEnding: 'и',
        correctEnding: 'ях',
        possibleEndings: ['ях', 'ей', 'ями', 'ью'],
        explanation: 'тетрадь 复数 -и 变为 -ях → тетрадях。',
        case6Type: 'replace'
      },
      {
        id: 30,
        text: 'Люди собрались на центральных <strong>площади</strong>.',
        targetWord: 'площади',
        originalEnding: 'и',
        correctEnding: 'ях',
        possibleEndings: ['ях', 'ей', 'ями', 'ью'],
        explanation: 'площадь 复数 -и 变为 -ях → площадях。',
        case6Type: 'replace'
      },
      {
        id: 31,
        text: 'Свет в этих <strong>окна</strong>.',
        targetWord: 'окна',
        originalEnding: 'а',
        correctEnding: 'ах',
        possibleEndings: ['ах', 'ов', 'ами', 'ом'],
        explanation: 'окно 复数 -о 变为 -ах → окнах。',
        case6Type: 'replace'
      },
      {
        id: 32,
        text: 'Он нашёл ошибки в длинных <strong>письма</strong>.',
        targetWord: 'письма',
        originalEnding: 'а',
        correctEnding: 'ах',
        possibleEndings: ['ах', 'ов', 'ами', 'ом'],
        explanation: 'письмо 复数 -а 变为 -ах → письмах。',
        case6Type: 'replace'
      },
      {
        id: 33,
        text: 'Корабли в тёплых <strong>моря</strong>.',
        targetWord: 'моря',
        originalEnding: 'я',
        correctEnding: 'ях',
        possibleEndings: ['ях', 'ей', 'ями', 'ем'],
        explanation: 'море 复数 -я 变为 -ях → морях。',
        case6Type: 'replace'
      },
      {
        id: 34,
        text: 'Мы гуляли в зелёных <strong>поля</strong>.',
        targetWord: 'поля',
        originalEnding: 'я',
        correctEnding: 'ях',
        possibleEndings: ['ях', 'ей', 'ями', 'ем'],
        explanation: 'поле 复数 -я 变为 -ях → полях。',
        case6Type: 'replace'
      },
      {
        id: 35,
        text: 'Они были в разных <strong>места</strong>.',
        targetWord: 'места',
        originalEnding: 'а',
        correctEnding: 'ах',
        possibleEndings: ['ах', 'ов', 'ами', 'ом'],
        explanation: 'место 复数 -а 变为 -ах → местах。',
        case6Type: 'replace'
      },
      // ========== 情况③：不仅需要改变末尾字母，而且其他部分也改变 ==========
      {
        id: 36,
        text: 'Мы говорили о том <strong>день</strong>.',
        targetWord: 'день',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'дне',
        possibleEndings: ['дне', 'дня', 'днём', 'дни'],
        explanation: 'день 词干变化 → дне。',
        case6Type: 'full'
      },
      {
        id: 37,
        text: 'Она говорит о своей <strong>дочь</strong>.',
        targetWord: 'дочь',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'дочери',
        possibleEndings: ['дочери', 'дочь', 'дочью', 'доче'],
        explanation: 'дочь 增加 -ер- → дочери。',
        case6Type: 'full'
      },
      {
        id: 38,
        text: 'Я думаю о свободном <strong>время</strong>.',
        targetWord: 'время',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'времени',
        possibleEndings: ['времени', 'время', 'временем', 'времена'],
        explanation: 'время 词干变化 → времени。',
        case6Type: 'full'
      },
      {
        id: 39,
        text: 'Он рассказал о своём <strong>имя</strong>.',
        targetWord: 'имя',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'имени',
        possibleEndings: ['имени', 'имя', 'именем', 'имена'],
        explanation: 'имя 词干变化 → имени。',
        case6Type: 'full'
      },
      {
        id: 40,
        text: 'Он рассказал о своих <strong>друзья</strong>.',
        targetWord: 'друзья',
        originalEnding: '',
        correctEnding: '',
        correctFullWord: 'друзьях',
        possibleEndings: ['друзьях', 'друзьями', 'друзей', 'друг'],
        explanation: 'друг 复数词干变化 → друзьях。',
        case6Type: 'full'
      }
    ]
    // 过滤出未使用的题目
    const availableSentences = case6Sentences.filter((sentence: any) => !usedPracticeSentences.value.includes(sentence.id))
    
    // 如果所有题目都用完了，重置已使用的题目列表
    if (availableSentences.length === 0) {
      usedPracticeSentences.value = []
      availableSentences.push(...case6Sentences)
    }
    
    // 随机选择一个未使用的句子
    const randomIndex = Math.floor(Math.random() * availableSentences.length)
    const selectedSentence = availableSentences[randomIndex]
    
    if (!selectedSentence) {
      // 如果没有可用的句子，重置并重新加载
      usedPracticeSentences.value = []
      loadPracticeSentence()
      return
    }
    
    // 记录已使用的题目ID
    usedPracticeSentences.value.push(selectedSentence.id)
    
    practiceSentence.value = selectedSentence as PracticeSentence
  }
}

// 选择词尾
const chooseEnding = (ending: string) => {
  selectedEnding.value = ending
  showDropdown.value = false
  
  // 不需要更新originalEnding，我们直接使用selectedEnding来显示所选词尾
  
  // 自动判断对错
  submitAnswer()
}

// 提交答案
const submitAnswer = () => {
  showResult.value = true
  const sentence = practiceSentence.value
  
  if (selectedCase.value === 1 && sentence.pluralCase1Type === 'full' && sentence.correctFullWord) {
    // 1格复数训练情况③：比较完整词
    if (selectedEnding.value === sentence.correctFullWord) {
      answerResult.value = 'correct'
    } else {
      answerResult.value = 'incorrect'
    }
  } else if (selectedCase.value === 2 && sentence.case2Type === 'full' && sentence.correctFullWord) {
    // 2格训练情况④：比较完整词
    if (selectedEnding.value === sentence.correctFullWord) {
      answerResult.value = 'correct'
    } else {
      answerResult.value = 'incorrect'
    }
  } else if (selectedCase.value === 3 && sentence.case3Type === 'full' && sentence.correctFullWord) {
    // 3格训练情况③：比较完整词
    if (selectedEnding.value === sentence.correctFullWord) {
      answerResult.value = 'correct'
    } else {
      answerResult.value = 'incorrect'
    }
  } else if (selectedCase.value === 4 && sentence.case4Type === 'full' && sentence.correctFullWord) {
    // 4格训练情况③：比较完整词
    if (selectedEnding.value === sentence.correctFullWord) {
      answerResult.value = 'correct'
    } else {
      answerResult.value = 'incorrect'
    }
  } else if (selectedCase.value === 4 && sentence.case4Type === 'nochange') {
    // 4格训练情况④：不变化
    if (selectedEnding.value === sentence.correctEnding) {
      answerResult.value = 'correct'
    } else {
      answerResult.value = 'incorrect'
    }
  } else if (selectedCase.value === 5 && sentence.case5Type === 'full' && sentence.correctFullWord) {
    // 5格训练情况③：比较完整词
    if (selectedEnding.value === sentence.correctFullWord) {
      answerResult.value = 'correct'
    } else {
      answerResult.value = 'incorrect'
    }
  } else if (selectedCase.value === 6 && sentence.case6Type === 'full' && sentence.correctFullWord) {
    // 6格训练情况③：比较完整词
    if (selectedEnding.value === sentence.correctFullWord) {
      answerResult.value = 'correct'
    } else {
      answerResult.value = 'incorrect'
    }
  } else if (selectedCase.value === 2 && sentence.case2Type === 'clear') {
    // 2格训练情况③：比较词尾是否为"/"
    if (selectedEnding.value === sentence.correctEnding) {
      answerResult.value = 'correct'
    } else {
      answerResult.value = 'incorrect'
    }
  } else {
    // 其他情况：比较词尾
    if (selectedEnding.value === sentence.correctEnding) {
      answerResult.value = 'correct'
    } else {
      answerResult.value = 'incorrect'
    }
  }
}

// 点击页面其他位置时关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  
  // 检查是否点击了目标词或下拉菜单
  const isClickOnTargetWord = target.closest('.clickable-target-word')
  const isClickOnDropdown = target.closest('.dropdown-container')
  
  // 如果没有点击目标词或下拉菜单，则关闭下拉菜单
  if (!isClickOnTargetWord && !isClickOnDropdown) {
    showDropdown.value = false
  }
}

// 组件挂载时添加点击事件监听器
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时移除点击事件监听器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  stopTimer()
})

// 下一题
const nextQuestion = () => {
  loadPracticeSentence()
}
</script>

<template>
  <div class="app-container">
    <!-- 测试确认弹窗 -->
    <div v-if="showTestConfirmModal" class="modal-overlay" @click.self="showTestConfirmModal = false">
      <div class="modal-content">
        <h3 class="modal-title">测试确认</h3>
        <p class="modal-text">还有未完成的测试，是否继续？</p>
        <div class="modal-buttons">
          <button class="modal-btn modal-btn-no" @click="enterTestPage(false)">否</button>
          <button class="modal-btn modal-btn-yes" @click="enterTestPage(true)">是</button>
        </div>
      </div>
    </div>

    <!-- 头部栏 -->
    <header class="header">
      <h1 class="main-title">СКЛОНЕНИЕ</h1>
      <p class="sub-title">俄语变格训练网站</p>
    </header>

    <!-- 内容区 -->
    <main class="content">
      <div v-if="currentPage === 'home'" class="home-content">
        <button class="training-btn" @click="navigateTo('case-training')">
          指定格训练
        </button>
        <button class="training-btn" @click="navigateTo('test')">
          测试
        </button>
      </div>

      <!-- 指定格训练页面 -->
      <div v-else-if="currentPage === 'case-training'" class="page-content page-full-width">
        <!-- 格选择界面 -->
        <div v-if="caseTrainingState === 'select-case'" class="case-select-container">
          <h2>指定格训练</h2>
          <p class="instruction">请选择要训练的变格：</p>
          <div class="case-buttons">
            <button 
              class="case-btn"
              @click="selectCase(1)"
            >
              1格（复数）
            </button>
            <button 
              v-for="i in 5" 
              :key="i+1"
              class="case-btn"
              @click="selectCase(i+1)"
            >
              {{ i+1 }}格
            </button>
          </div>
        </div>

        <!-- 新手教学界面 -->
        <div v-else-if="caseTrainingState === 'tutorial'" class="tutorial-container">
          <div class="tutorial-header">
            <button class="back-btn" @click="backToCaseSelect">
              <ArrowLeft />
            </button>
            <h2>{{ selectedCase }}格新手教学</h2>
          </div>
          
          <div class="tutorial-content">
            <div class="case-function">
              <h3>功能</h3>
              <p v-if="selectedCase === 2">
                2格（属格）表示所属关系，回答"谁的？什么的？"的问题。
              </p>
              <p v-else-if="selectedCase === 3">
                3格（与格）表示动作的间接对象，回答"给谁？对谁？"的问题。
              </p>
              <p v-else-if="selectedCase === 4">
                4格（宾格）表示动作的直接对象，回答"谁？什么？"的问题。
              </p>
              <p v-else-if="selectedCase === 5">
                5格（工具格）表示动作的工具或手段，回答"用什么？通过什么？"的问题。
              </p>
              <p v-else-if="selectedCase === 6">
                6格（前置格）表示地点或状态，通常与前置词连用。
              </p>
            </div>

            <div class="case-endings">
              <h3>词尾变化规则</h3>
              
              <div class="gender-group">
                <h4>阳性名词</h4>
                <div class="ending-example" v-if="selectedCase === 2">
                  <h5>单数形式</h5>
                  <p>以辅音结尾：-а (如：стол → стола)</p>
                  <p>以-й结尾：-я (如：музей → музея)</p>
                  <p>以-ь结尾：-я (如：учитель → учителя)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以辅音结尾：-ов (如：стол → столы → столов)</p>
                  <p>以-й结尾：-ев (如：музей → музеи → музеев)</p>
                  <p>以-ь结尾：-ей (如：учитель → учители → учителей)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 3">
                  <h5>单数形式</h5>
                  <p>以辅音结尾：-у (如：стол → столу)</p>
                  <p>以-й结尾：-ю (如：музей → музею)</p>
                  <p>以-ь结尾：-ю (如：учитель → учителю)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以辅音结尾：-ам (如：стол → столы → столам)</p>
                  <p>以-й结尾：-ям (如：музей → музеи → музеям)</p>
                  <p>以-ь结尾：-ям (如：учитель → учители → учителям)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 4">
                  <h5>单数形式</h5>
                  <p>非动物名词：不变位 (如：стол → стол)</p>
                  <p>动物名词：同2格 (如：учитель → учителя)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>非动物名词：不变位 (如：стол → столы → столы)</p>
                  <p>动物名词：同2格 (如：учитель → учители → учителей)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 5">
                  <h5>单数形式</h5>
                  <p>以辅音结尾：-ом (如：стол → столом)</p>
                  <p>以-й结尾：-ем (如：музей → музеем)</p>
                  <p>以-ь结尾：-ем (如：учитель → учителем)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以辅音结尾：-ами (如：стол → столы → столами)</p>
                  <p>以-й结尾：-ями (如：музей → музеи → музеями)</p>
                  <p>以-ь结尾：-ями (如：учитель → учители → учителями)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 6">
                  <h5>单数形式</h5>
                  <p>以辅音结尾：-е (如：стол → столе)</p>
                  <p>以-й结尾：-е (如：музей → музее)</p>
                  <p>以-ь结尾：-е (如：учитель → учителе)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以辅音结尾：-ах (如：стол → столы → столах)</p>
                  <p>以-й结尾：-ях (如：музей → музеи → музеях)</p>
                  <p>以-ь结尾：-ях (如：учитель → учители → учителях)</p>
                </div>
              </div>

              <div class="gender-group">
                <h4>阴性名词</h4>
                <div class="ending-example" v-if="selectedCase === 2">
                  <h5>单数形式</h5>
                  <p>以-а结尾：-ы (如：школа → школы)</p>
                  <p>以-я结尾：-и (如：тетя → тети)</p>
                  <p>以-ь结尾：-и (如：тётя → тёти)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以-а结尾：无词尾 (如：книга → книги → книг)</p>
                  <p>以-я结尾：无词尾 (如：тетя → тети → тет)</p>
                  <p>以-ь结尾：-ей (如：ночь → ночи → ночей)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 3">
                  <h5>单数形式</h5>
                  <p>以-а结尾：-е (如：книга → книге)</p>
                  <p>以-я结尾：-ю (如：тетя → тетю)</p>
                  <p>以-ь结尾：-и (如：тётя → тёти)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以-а结尾：-ам (如：книга → книги → книгам)</p>
                  <p>以-я结尾：-ям (如：тетя → тети → тетям)</p>
                  <p>以-ь结尾：-ям (如：ночь → ночи → ночам)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 4">
                  <h5>单数形式</h5>
                  <p>以-а结尾：-у (如：книга → книгу)</p>
                  <p>以-я结尾：-ю (如：тетя → тетю)</p>
                  <p>以-ь结尾：不变位 (如：ночь → ночь)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以-а结尾：不变位 (如：книга → книги → книги)</p>
                  <p>以-я结尾：不变位 (如：тетя → тети → тети)</p>
                  <p>以-ь结尾：不变位 (如：ночь → ночи → ночи)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 5">
                  <h5>单数形式</h5>
                  <p>以-а结尾：-ой (如：книга → книгой)</p>
                  <p>以-я结尾：-ей (如：тетя → тетей)</p>
                  <p>以-ь结尾：-ью (如：ночь → ночью)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以-а结尾：-ами (如：книга → книги → книгами)</p>
                  <p>以-я结尾：-ями (如：тетя → тети → тетями)</p>
                  <p>以-ь结尾：-ями (如：ночь → ночи → ночями)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 6">
                  <h5>单数形式</h5>
                  <p>以-а结尾：-е (如：книга → книге)</p>
                  <p>以-я结尾：-и (如：тетя → тети)</p>
                  <p>以-ь结尾：-и (如：тётя → тёти)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以-а结尾：-ах (如：книга → книги → книгах)</p>
                  <p>以-я结尾：-ях (如：тетя → тети → тетях)</p>
                  <p>以-ь结尾：-ях (如：ночь → ночи → ночях)</p>
                </div>
              </div>

              <div class="gender-group">
                <h4>中性名词</h4>
                <div class="ending-example" v-if="selectedCase === 2">
                  <h5>单数形式</h5>
                  <p>以-о结尾：-а (如：окно → окна)</p>
                  <p>以-е结尾：-я (如：поле → поля)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以-о结尾：无词尾 (如：окно → окна → окон)</p>
                  <p>以-е结尾：无词尾 (如：поле → поля → полей)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 3">
                  <h5>单数形式</h5>
                  <p>以-о结尾：-у (如：окно → окну)</p>
                  <p>以-е结尾：-ю (如：поле → полю)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以-о结尾：-ам (如：окно → окна → окнам)</p>
                  <p>以-е结尾：-ям (如：поле → поля → полям)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 4">
                  <h5>单数形式</h5>
                  <p>不变位 (如：окно → окно, поле → поле)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>不变位 (如：окно → окна → окна, поле → поля → поля)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 5">
                  <h5>单数形式</h5>
                  <p>以-о结尾：-ом (如：окно → окном)</p>
                  <p>以-е结尾：-ем (如：поле → полем)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以-о结尾：-ами (如：окно → окна → окнами)</p>
                  <p>以-е结尾：-ями (如：поле → поля → полями)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 6">
                  <h5>单数形式</h5>
                  <p>以-о结尾：-е (如：окно → окне)</p>
                  <p>以-е结尾：-е (如：поле → поле)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以-о结尾：-ах (如：окно → окна → окнах)</p>
                  <p>以-е结尾：-ях (如：поле → поля → полях)</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- 实战训练界面 -->
        <div v-else-if="caseTrainingState === 'practice'" class="practice-container">
          <div class="practice-header">
            <button class="back-btn" @click="backToCaseSelect">
              <ArrowLeft />
            </button>
            <h2>{{ selectedCase }}格实战训练</h2>
          </div>
          
          <div class="practice-content">
            <!-- 提示文字 -->
            <p class="hint-text">点击高亮的名词进行变格</p>
            
            <!-- 句子展示 -->
            <div class="sentence-container">
              <p class="sentence" v-html="fullSentenceHtml" @click="handleSentenceClick($event)"></p>
              <!-- 词尾选择下拉菜单 -->
              <div 
                class="dropdown-container" 
                v-if="showDropdown" 
                :style="{ position: 'fixed', top: dropdownTop + 'px', left: dropdownLeft + 'px', zIndex: 1000 }"
              >
                <div class="dropdown">
                  <div 
                    v-for="(ending, index) in practiceSentence.possibleEndings.filter(e => e !== '')" 
                    :key="index"
                    class="dropdown-item"
                    @click="chooseEnding(ending)"
                  >
                    <template v-if="selectedCase === 1 && practiceSentence.pluralCase1Type === 'full'">
                      {{ ending }}
                    </template>
                    <template v-else>
                      {{ ending }}
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- 答案结果 -->
            <div class="result-container" v-if="showResult">
              <div class="result-icon" :class="answerResult">
                {{ answerResult === 'correct' ? '✔' : '❌' }}
              </div>
              <div class="result-message">
                <p v-if="answerResult === 'correct'" class="correct-message">
                  正确！
                </p>
                <p v-else-if="answerResult === 'incorrect'" class="incorrect-message">
                  错误！
                </p>
                <p class="explanation" v-if="answerResult === 'incorrect'">
                  正确答案：
                  <span>{{ getSimpleCorrectAnswer() }}</span>
                </p>
                <p class="explanation">
                  {{ practiceSentence.explanation }}
                </p>
              </div>
              <button class="next-btn" @click="nextQuestion">
                下一题
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="currentPage === 'test'" class="page-content">
        <h2>测试</h2>
        <p class="instruction">共15题，选择正确的变格形式</p>
        
        <!-- 测试进行中 -->
        <div v-if="testState === 'ongoing'" class="test-content">
          <!-- 题目导航 -->
          <div class="question-navigation">
            <span class="question-number">第 {{ currentQuestionIndex + 1 }} / 15 题</span>
            <span class="timer" :class="{ 'warning': testTimeLeft <= 30 }">
              ⏱️ {{ formatTime(testTimeLeft) }}
            </span>
          </div>

          <!-- 题目展示 -->
          <div class="question-container">
            <p class="question-text" v-html="testQuestions[currentQuestionIndex]?.text"></p>
          </div>

          <!-- 选项选择 -->
          <div class="options-container">
            <button 
              v-for="(option, idx) in testQuestions[currentQuestionIndex]?.options" 
              :key="idx"
              class="option-btn" 
              :class="{
                'selected': selectedAnswer === idx
              }"
              @click="chooseAnswer(idx as number)"
              :disabled="false"
            >
              {{ String.fromCharCode(65 + (idx as number)) }}. {{ option }}
            </button>
          </div>

          <!-- 导航按钮 -->
          <div class="nav-buttons">
            <button 
              class="nav-btn" 
              @click="testPrevQuestion"
              :disabled="currentQuestionIndex === 0"
            >
              上一题
            </button>
            
            <button 
              v-if="currentQuestionIndex < 14"
              class="nav-btn next-btn"
              @click="testNextQuestion"
            >
              下一题
            </button>
          </div>
        </div>

        <!-- 答案解析页面 -->
        <div v-else-if="testState === 'completed' && !showTestSummary" class="test-content">
          <!-- 题目导航 -->
          <div class="question-navigation">
            <span class="question-number">第 {{ currentQuestionIndex + 1 }} / 15 题</span>
          </div>

          <!-- 题目展示 -->
          <div class="question-container">
            <p class="question-text" v-html="testQuestions[currentQuestionIndex]?.text"></p>
          </div>

          <!-- 选项选择 -->
          <div class="options-container">
            <button 
              v-for="(option, idx) in testQuestions[currentQuestionIndex]?.options" 
              :key="idx"
              class="option-btn" 
              :class="{
                'selected': userAnswers[currentQuestionIndex] === idx,
                'correct': idx === testQuestions[currentQuestionIndex]?.correctAnswer,
                'incorrect': userAnswers[currentQuestionIndex] === idx && userAnswers[currentQuestionIndex] !== testQuestions[currentQuestionIndex]?.correctAnswer
              }"
              :disabled="true"
            >
              {{ String.fromCharCode(65 + (idx as number)) }}. {{ option }}
            </button>
          </div>

          <!-- 答案结果 -->
          <div class="test-result">
            <div class="result-icon" :class="userAnswers[currentQuestionIndex] === testQuestions[currentQuestionIndex]?.correctAnswer ? 'correct' : 'incorrect'">
              {{ userAnswers[currentQuestionIndex] === testQuestions[currentQuestionIndex]?.correctAnswer ? '✔' : '❌' }}
            </div>
            <p class="result-explanation">{{ testQuestions[currentQuestionIndex]?.explanation }}</p>
          </div>

          <!-- 导航按钮 -->
          <div class="nav-buttons">
            <button 
              class="nav-btn" 
              @click="testPrevQuestion"
              :disabled="currentQuestionIndex === 0"
            >
              上一题
            </button>
            
            <button 
              v-if="currentQuestionIndex < 19"
              class="nav-btn next-btn"
              @click="testNextQuestion"
            >
              下一题
            </button>
            <button 
              class="nav-btn"
              @click="showTestSummary = true"
            >
              返回总结
            </button>
          </div>
        </div>

        <!-- 测试完成 -->
        <div v-if="testState === 'completed' && showTestSummary" class="test-completed">
          <h3>测试完成！</h3>
          <div class="score-container">
            <span class="score">得分：{{ testScore }} / 15</span>
          </div>
          
          <div class="test-summary">
            <h4>答题情况</h4>
            <div class="answer-summary">
              <div 
                v-for="(question, idx) in testQuestions" 
                :key="question.id"
                class="summary-item"
                @click="goToQuestion(idx as number)"
              >
                <span class="summary-question-number">第 {{ idx + 1 }} 题</span>
                <span 
                  class="summary-status"
                  :class="{
                    'correct': userAnswers[idx as number] === question.correctAnswer,
                    'incorrect': userAnswers[idx as number] !== question.correctAnswer && userAnswers[idx as number] !== -1,
                    'unanswered': userAnswers[idx as number] === -1
                  }"
                >
                  {{ userAnswers[idx as number] === question.correctAnswer ? '正确' : userAnswers[idx as number] === -1 ? '未答' : '错误' }}
                </span>
              </div>
            </div>
          </div>

          <button class="restart-btn" @click="restartTest">
            重新测试
          </button>
        </div>
      </div>

      <div v-else-if="currentPage === 'declension-rules'" class="page-content page-full-width">
        <h2>变格规则</h2>
        <p class="instruction">俄语名词六个格的变化规则</p>
        
        <!-- 变格规则内容 - 移动端保持原样 -->
        <div class="declension-rules mobile-only">
          <!-- 1格 -->
          <div class="case-rule">
            <div class="case-header" @click="toggleCaseExpansion(1)">
              <h3>1格（主格）</h3>
              <span class="expand-icon">{{ expandedCases[1] ? '▼' : '▶' }}</span>
            </div>
            <div v-if="expandedCases[1]" class="case-content">
              <div class="case-function">
                <h4>功能</h4>
                <p>表示动作的主体或主语，回答"谁？什么？"的问题。</p>
              </div>
              <div class="case-endings">
                <h4>词尾变化</h4>
                <div class="number-group">
                  <h5>单数形式</h5>
                  <p>1格为名词的原型，不需要变化。</p>
                </div>
                <div class="number-group">
                  <h5>复数形式</h5>
                  <div class="gender-group">
                    <h6>阳性名词</h6>
                    <ul>
                      <li>以辅音结尾：加-ы (如：стол → столы)</li>
                      <li>以-й,-ь; -г,-к,-х,-ж,-ч,-ш,-щ结尾：变-и <br>(如：музей → музеи, конь → кони, нож → ножи, язык → языки, стих→ стихи́等)</li>
                      <li>特殊：重音移动至词尾时，变а或я。（如：до'м → дома', ле'с → леса', учи'тель → учителя'）</li>
                    </ul>
                  </div>
                  <div class="gender-group">
                    <h6>中性名词</h6>
                    <ul>
                      <li>以-о结尾：变-а (如：окно → окна)</li>
                      <li>以-е结尾：变-я (如：море → моря)</li>
                      <li>以мя结尾：变-мена (如：время → времена)</li>
                    </ul>
                  </div>
                  <div class="gender-group">
                    <h6>阴性名词</h6>
                    <ul>
                      <li>以-а结尾：加-ы (如：машина → машины)<br>特殊：га, ка, ха, жа, ча, ша, ща结尾：а变-и（如：книга → книги, рука → руки）</li>
                      <li>以-ь,-я结尾：变-и (如：ночь → ночи, неделя → недели)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2格 -->
          <div class="case-rule">
            <div class="case-header" @click="toggleCaseExpansion(2)">
              <h3>2格（属格）</h3>
              <span class="expand-icon">{{ expandedCases[2] ? '▼' : '▶' }}</span>
            </div>
            <div v-if="expandedCases[2]" class="case-content">
              <div class="case-function">
                <h4>功能</h4>
                <p>表示所属关系，回答"谁的？什么的？"的问题。</p>
              </div>
              <div class="case-endings">
                <h4>词尾变化</h4>
                <div class="number-group">
                  <h5>单数形式</h5>
                  <div class="gender-group">
                    <h6>阳性名词</h6>
                    <ul>
                      <li>以辅音结尾：加-а (如：стол → стола, нож → ножа)</li>
                      <li>以-й, -ь结尾：变-я (如：музей → музея, учитель → учителя)</li>
                    </ul>
                  </div>
                  <div class="gender-group">
                    <h6>中性名词</h6>
                    <ul>
                      <li>以-о结尾：变-а (如：окно → окна)</li>
                      <li>以-е结尾：变-я (如：море → моря)</li>
                      <li>以-мя结尾：变-мени (如：время → времени)</li>
                    </ul>
                  </div>
                  <div class="gender-group">
                    <h6>阴性名词</h6>
                    <ul>
                      <li>以-а结尾：加-ы (如：школа → школы)<br>特殊：га, ка, ха, жа, ча, ша, ща  结尾不写 ы 而写 и(如：книга → книги,  рука → руки, муха → мухи)</li>
                      <li>以-я结尾：变-и (如：семья → семьи)</li>
                      <li>以-ь结尾：变-и (如：дверь → двери)</li>
                    </ul>
                  </div>
                </div>
                <div class="number-group">
                  <h5>复数形式</h5>
                  <div class="gender-group">
                    <h6>阳性名词</h6>
                    <ul>
                      <li>以辅音结尾：加-ов (如：стол → столов)</li>
                      <li>以-й结尾：变-ев (如：музей → музеев)</li>
                      <li>以-ц结尾：重音在前时，加-ев<br> (如：та́нец → та́нцев)<br>重音在后时，加-ов<br>(如：коне́ц → концо́в)</li>
                      <li>以-ь,-ж, -ш, -ч, -щ结尾：-ей (如：словарь → словарей，врач → врачей)</li>
                      <li>部分阳性名词不变（如：человек → человек，сапог → сапог，глаз → глаз，раз → раз）</li>
                    </ul>
                  </div>
                  <div class="gender-group">
                    <h6>中性名词</h6>
                    <ul>
                      <li>以-о结尾：清尾 (如：окно → окон, место → мест, письмо → писем)</li>
                      <li>以-е结尾：加-й (如：море → морей)</li>
                      <li>以-ие 结尾：变为-ий（例：здание → зданий）</li>
                      <li>以-мя结尾：变为 -мён（如：время → времён）</li>
                    </ul>
                  </div>
                  <div class="gender-group">
                    <h6>阴性名词</h6>
                    <ul>
                      <li>以-а结尾：<br>①清尾 (如：книга → книг)<br>②清尾，并在末尾辅音字母前加-о/-е（如：сестра → сестёр，доска → досок）</li>
                      <li>以-я结尾：<br>①变-ей (如：доля → долей)<br>②清尾，并在末尾辅音字母前加-е（如：песня → песен）<br>③变ь，并在末尾辅音字母前加-е（如：земля → земель）</li>
                      <li>以-ь结尾：变-ей (如：площадь → площадей)</li>
                      <li>以-ия 结尾：变-ий(如：армия → армий)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3格 -->
          <div class="case-rule">
            <div class="case-header" @click="toggleCaseExpansion(3)">
              <h3>3格（与格）</h3>
              <span class="expand-icon">{{ expandedCases[3] ? '▼' : '▶' }}</span>
            </div>
            <div v-if="expandedCases[3]" class="case-content">
              <div class="case-function">
                <h4>功能</h4>
                <p>表示动作的间接对象，回答"给谁？对谁？"的问题。</p>
              </div>
              <div class="case-endings">
                <h4>词尾变化</h4>
                <div class="number-group">
                  <h5>单数形式</h5>
                  <div class="gender-group">
                    <h6>阳性名词</h6>
                    <ul>
                      <li>以辅音结尾：-у (如：стол → столу)</li>
                      <li>以-й结尾：-ю (如：музей → музею)</li>
                      <li>以-ь结尾：-ю (如：учитель → учителю)</li>
                    </ul>
                  </div>
                  <div class="gender-group">
                    <h6>中性名词</h6>
                    <ul>
                      <li>以-о结尾：-у (如：окно → окну)</li>
                      <li>以-е结尾：-ю (如：море → морю)</li>
                      <li>以-мя结尾：-мени (如：время → времени)</li>
                    </ul>
                  </div>
                  <div class="gender-group">
                    <h6>阴性名词</h6>
                    <ul>
                      <li>以-а, -я结尾：变-е (如：книга → книге, неделя → неделе)</li>
                      <li>以-ия结尾：变-ии (如：Россия → России)</li>
                      <li>以-ь结尾：变-и (如：ночь → ночи)</li>
                    </ul>
                  </div>
                </div>
                <div class="number-group">
                  <h5>复数形式</h5>
                  <div class="gender-group">
                    <h6>不论性</h6>
                    <ul>
                      <li>以辅音结尾或-а结尾：-ам (如：стол → столам, книга → книгам)</li>
                      <li>以-й,-ь,-е,-я结尾 → 变-ям (如：музей → музеям, учитель → учителям)</li>
                      <li>特殊：以 -мя 结尾的中性名词 → 加 -енам（время → временам）</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 4格 -->
          <div class="case-rule">
            <div class="case-header" @click="toggleCaseExpansion(4)">
              <h3>4格（宾格）</h3>
              <span class="expand-icon">{{ expandedCases[4] ? '▼' : '▶' }}</span>
            </div>
            <div v-if="expandedCases[4]" class="case-content">
              <div class="case-function">
                <h4>功能</h4>
                <p>表示动作的直接对象，回答"谁？什么？"的问题。</p>
              </div>
              <div class="case-endings">
                <h4>词尾变化</h4>
                <div class="number-group">
                  <h5>单数形式</h5>
                  <div class="gender-group">
                    <h6>阳性名词</h6>
                    <ul>
                      <li>非动物名词：不变 (如：стол → стол)</li>
                      <li>动物名词：同2格单数 (如：учитель → учителя)</li>
                    </ul>
                  </div>
                  <div class="gender-group">
                    <h6>中性名词</h6>
                    <ul>
                      <li>不变位 (如：окно → окно)</li>
                    </ul>
                  </div>
                  <div class="gender-group">
                    <h6>阴性名词</h6>
                    <ul>
                      <li>以-а结尾：-у (如：книга → книгу)</li>
                      <li>以-я结尾：-ю (如：тетя → тетю)</li>
                      <li>以-ь结尾：不变位 (如：ночь → ночь)</li>
                    </ul>
                  </div>
                </div>
                <div class="number-group">
                  <h5>复数形式</h5>
                  <div class="gender-group">
                    <h6>不论性</h6>
                    <ul>
                      <li>非动物名词：同1格复数 (如：стол → столы，книга → книги)</li>
                      <li>动物名词：同2格复数 (如：учитель → учителей，кошка → кошек)</li>
                      <li>中性名词：同1格复数 (如：окно → окна, море → моря)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 5格 -->
          <div class="case-rule">
            <div class="case-header" @click="toggleCaseExpansion(5)">
              <h3>5格（工具格）</h3>
              <span class="expand-icon">{{ expandedCases[5] ? '▼' : '▶' }}</span>
            </div>
            <div v-if="expandedCases[5]" class="case-content">
              <div class="case-function">
                <h4>功能</h4>
                <p>表示动作的工具或手段，回答"用什么？通过什么？"的问题。</p>
              </div>
              <div class="case-endings">
                <h4>词尾变化</h4>
                <div class="number-group">
                  <h5>单数形式</h5>
                  <div class="gender-group">
                    <h6>阳性、中性名词</h6>
                    <ul>
                      <li>一般情况：-ом (如：стол → столом, окно → окном)</li>
                      <li>以-й, -ь, -е(ё)结尾：变-ем/-ём (如：музей → музеем, словарь → словарём, поле → полем)</li>
                      <li>以 ж, ч, ш, щ结尾：加-ем（如：нож → ножом, товарищ → товарищем）</li>
                    </ul>
                  </div>
                  <div class="gender-group">
                    <h6>阴性名词</h6>
                    <ul>
                      <li>以-а结尾：变-ой (如：книга → книгой)</li>
                      <li>以-я结尾：变-ей (如：тетя → тетей)</li>
                      <li>以-ь结尾：加-ю (如：ночь → ночью)</li>
                    </ul>
                  </div>
                </div>
                <div class="number-group">
                  <h5>复数形式</h5>
                  <div class="gender-group">
                    <h6>不论性</h6>
                    <ul>
                      <li>一般情况下：加-ами (如：стол → столами)</li>
                      <li>以-й,е,-я,-ь结尾：变-ями (如：музей → музеями, поле → полями, тётя → тётями, учитель → учителями)</li>
                      <li>特殊复数形式ья结尾：-ями （如：друзья（朋友们）→ друзьями, деревья（树木们）→ деревьями</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 6格 -->
          <div class="case-rule">
            <div class="case-header" @click="toggleCaseExpansion(6)">
              <h3>6格（前置格）</h3>
              <span class="expand-icon">{{ expandedCases[6] ? '▼' : '▶' }}</span>
            </div>
            <div v-if="expandedCases[6]" class="case-content">
              <div class="case-function">
                <h4>功能</h4>
                <p>表示地点或状态，通常与前置词连用。</p>
              </div>
              <div class="case-endings">
                <h4>词尾变化</h4>
                <div class="number-group">
                  <h5>单数形式</h5>
                  <div class="gender-group">
                    <h6>不论性</h6>
                    <ul>
                      <li>一般情况下：加-е (如：стол → о столе, город → в городе)<br>特殊：重音移动（如：лес → в лесу́，сад → в саду́，мост → на мосту́，пол → на полу́，шкаф → в шкафу́，берег → на берегу́）</li>
                      <li>阳性-ий、中性-ие、阴性-ия、-ь: 末尾变-и<br>（如：санаторий → в санатории, здание → в здании, станция → на станции, ночь → в ночи）</li>
                    </ul>
                  </div>
                </div>
                <div class="number-group">
                  <h5>复数形式</h5>
                  <div class="gender-group">
                    <h6>不分性</h6>
                    <ul>
                      <li>一般情况：-ах (如：стол → столах，место → местах，машина → машинах)</li>
                      <li>以-й,-ь,-я,-е结尾：-ях <br>(如：музей → в музеях, камень → на камнях, неделя → в неделях, море → в морях)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 变格规则内容 - 电脑端左右布局 -->
        <div class="declension-rules-desktop desktop-only">
          <div class="rules-sidebar">
            <button 
              v-for="caseNum in 6" 
              :key="caseNum"
              class="case-sidebar-btn"
              :class="{ active: selectedDesktopCase === caseNum }"
              @click="toggleCaseExpansion(caseNum)"
            >
              {{ caseNum }}格
            </button>
          </div>
          <div class="rules-content">
            <template v-if="selectedDesktopCase !== null">
              <div :key="'case-' + selectedDesktopCase">
                <!-- 1格 -->
                <template v-if="selectedDesktopCase === 1">
                  <h3>1格（主格）</h3>
                  <div class="case-function">
                    <h4>功能</h4>
                    <p>表示动作的主体或主语，回答"谁？什么？"的问题。</p>
                  </div>
                  <div class="case-endings">
                    <h4>词尾变化</h4>
                    <div class="number-groups-container">
                      <div class="number-group">
                        <h5>单数形式</h5>
                        <p>1格为名词的原型，不需要变化。</p>
                      </div>
                      <div class="number-group">
                        <h5>复数形式</h5>
                        <div class="gender-group">
                          <h6>阳性名词</h6>
                          <ul>
                            <li>以辅音结尾：加-ы (如：стол → столы)</li>
                            <li>以-й,-ь; -г,-к,-х,-ж,-ч,-ш,-щ结尾：变-и <br>(如：музей → музеи, конь → кони, нож → ножи, язык → языки, стих→ стихи́等)</li>
                            <li>特殊：重音移动至词尾时，变а或я。（如：до'м → дома', ле'с → леса', учи'тель → учителя'）</li>
                          </ul>
                        </div>
                        <div class="gender-group">
                          <h6>中性名词</h6>
                          <ul>
                            <li>以-о结尾：变-а (如：окно → окна)</li>
                            <li>以-е结尾：变-я (如：море → моря)</li>
                            <li>以мя结尾：变-мена (如：время → времена)</li>
                          </ul>
                        </div>
                        <div class="gender-group">
                          <h6>阴性名词</h6>
                          <ul>
                            <li>以-а结尾：加-ы (如：машина → машины)<br>特殊：га, ка, ха, жа, ча, ша, ща结尾：а变-и（如：книга → книги, рука → руки）</li>
                            <li>以-ь,-я结尾：变-и (如：ночь → ночи, неделя → недели)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 2格 -->
                <template v-else-if="selectedDesktopCase === 2">
                  <h3>2格（属格）</h3>
                  <div class="case-function">
                    <h4>功能</h4>
                    <p>表示所属关系，回答"谁的？什么的？"的问题。</p>
                  </div>
                  <div class="case-endings">
                    <h4>词尾变化</h4>
                    <div class="number-groups-container">
                      <div class="number-group">
                        <h5>单数形式</h5>
                        <div class="gender-group">
                          <h6>阳性名词</h6>
                          <ul>
                            <li>以辅音结尾：加-а (如：стол → стола, нож → ножа)</li>
                            <li>以-й, -ь结尾：变-я (如：музей → музея, учитель → учителя)</li>
                          </ul>
                        </div>
                        <div class="gender-group">
                          <h6>中性名词</h6>
                          <ul>
                            <li>以-о结尾：变-а (如：окно → окна)</li>
                            <li>以-е结尾：变-я (如：море → моря)</li>
                            <li>以-мя结尾：变-мени (如：время → времени)</li>
                          </ul>
                        </div>
                        <div class="gender-group">
                          <h6>阴性名词</h6>
                          <ul>
                            <li>以-а结尾：加-ы (如：школа → школы)<br>特殊：га, ка, ха, жа, ча, ша, ща  结尾不写 ы 而写 и(如：книга → книги,  рука → руки, муха → мухи)</li>
                            <li>以-я结尾：变-и (如：семья → семьи)</li>
                            <li>以-ь结尾：变-и (如：дверь → двери)</li>
                          </ul>
                        </div>
                      </div>
                      <div class="number-group">
                        <h5>复数形式</h5>
                        <div class="gender-group">
                          <h6>阳性名词</h6>
                          <ul>
                            <li>以辅音结尾：加-ов (如：стол → столов)</li>
                            <li>以-й结尾：变-ев (如：музей → музеев)</li>
                            <li>以-ц结尾：重音在前时，加-ев<br> (如：та́нец → та́нцев)<br>重音在后时，加-ов<br>(如：коне́ц → концо́в)</li>
                            <li>以-ь,-ж, -ш, -ч, -щ结尾：-ей (如：словарь → словарей，врач → врачей)</li>
                            <li>部分阳性名词不变（如：человек → человек，сапог → сапог，глаз → глаз，раз → раз）</li>
                          </ul>
                        </div>
                        <div class="gender-group">
                          <h6>中性名词</h6>
                          <ul>
                            <li>以-о结尾：清尾 (如：окно → окон, место → мест, письмо → писем)</li>
                            <li>以-е结尾：加-й (如：море → морей)</li>
                            <li>以-ие 结尾：变为-ий（例：здание → зданий）</li>
                            <li>以-мя结尾：变为 -мён（如：время → времён）</li>
                          </ul>
                        </div>
                        <div class="gender-group">
                          <h6>阴性名词</h6>
                          <ul>
                            <li>以-а结尾：<br>①清尾 (如：книга → книг)<br>②清尾，并在末尾辅音字母前加-о/-е（如：сестра → сестёр，доска → досок）</li>
                            <li>以-я结尾：<br>①变-ей (如：доля → долей)<br>②清尾，并在末尾辅音字母前加-е（如：песня → песен）<br>③变ь，并在末尾辅音字母前加-е（如：земля → земель）</li>
                            <li>以-ь结尾：变-ей (如：площадь → площадей)</li>
                            <li>以-ия 结尾：变-ий(如：армия → армий)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 3格 -->
                <template v-else-if="selectedDesktopCase === 3">
                  <h3>3格（与格）</h3>
                  <div class="case-function">
                    <h4>功能</h4>
                    <p>表示动作的间接对象，回答"给谁？对谁？"的问题。</p>
                  </div>
                  <div class="case-endings">
                    <h4>词尾变化</h4>
                    <div class="number-groups-container">
                      <div class="number-group">
                        <h5>单数形式</h5>
                        <div class="gender-group">
                          <h6>阳性名词</h6>
                          <ul>
                            <li>以辅音结尾：-у (如：стол → столу)</li>
                            <li>以-й结尾：-ю (如：музей → музею)</li>
                            <li>以-ь结尾：-ю (如：учитель → учителю)</li>
                          </ul>
                        </div>
                        <div class="gender-group">
                          <h6>中性名词</h6>
                          <ul>
                            <li>以-о结尾：-у (如：окно → окну)</li>
                            <li>以-е结尾：-ю (如：море → морю)</li>
                            <li>以-мя结尾：-мени (如：время → времени)</li>
                          </ul>
                        </div>
                        <div class="gender-group">
                          <h6>阴性名词</h6>
                          <ul>
                            <li>以-а, -я结尾：变-е (如：книга → книге, неделя → неделе)</li>
                            <li>以-ия结尾：变-ии (如：Россия → России)</li>
                            <li>以-ь结尾：变-и (如：ночь → ночи)</li>
                          </ul>
                        </div>
                      </div>
                      <div class="number-group">
                        <h5>复数形式</h5>
                        <div class="gender-group">
                          <h6>不论性</h6>
                          <ul>
                            <li>以辅音结尾或-а结尾：-ам (如：стол → столам, книга → книгам)</li>
                            <li>以-й,-ь,-е,-я结尾 → 变-ям (如：музей → музеям, учитель → учителям)</li>
                            <li>特殊：以 -мя 结尾的中性名词 → 加 -енам（время → временам）</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 4格 -->
                <template v-else-if="selectedDesktopCase === 4">
                  <h3>4格（宾格）</h3>
                  <div class="case-function">
                    <h4>功能</h4>
                    <p>表示动作的直接对象，回答"谁？什么？"的问题。</p>
                  </div>
                  <div class="case-endings">
                    <h4>词尾变化</h4>
                    <div class="number-groups-container">
                      <div class="number-group">
                        <h5>单数形式</h5>
                        <div class="gender-group">
                          <h6>阳性名词</h6>
                          <ul>
                            <li>非动物名词：不变 (如：стол → стол)</li>
                            <li>动物名词：同2格单数 (如：учитель → учителя)</li>
                          </ul>
                        </div>
                        <div class="gender-group">
                          <h6>中性名词</h6>
                          <ul>
                            <li>不变位 (如：окно → окно)</li>
                          </ul>
                        </div>
                        <div class="gender-group">
                          <h6>阴性名词</h6>
                          <ul>
                            <li>以-а结尾：-у (如：книга → книгу)</li>
                            <li>以-я结尾：-ю (如：тетя → тетю)</li>
                            <li>以-ь结尾：不变位 (如：ночь → ночь)</li>
                          </ul>
                        </div>
                      </div>
                      <div class="number-group">
                        <h5>复数形式</h5>
                        <div class="gender-group">
                          <h6>不论性</h6>
                          <ul>
                            <li>非动物名词：同1格复数 (如：стол → столы，книга → книги)</li>
                            <li>动物名词：同2格复数 (如：учитель → учителей，кошка → кошек)</li>
                            <li>中性名词：同1格复数 (如：окно → окна, море → моря)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 5格 -->
                <template v-else-if="selectedDesktopCase === 5">
                  <h3>5格（工具格）</h3>
                  <div class="case-function">
                    <h4>功能</h4>
                    <p>表示动作的工具或手段，回答"用什么？通过什么？"的问题。</p>
                  </div>
                  <div class="case-endings">
                    <h4>词尾变化</h4>
                    <div class="number-groups-container">
                      <div class="number-group">
                        <h5>单数形式</h5>
                        <div class="gender-group">
                          <h6>阳性、中性名词</h6>
                          <ul>
                            <li>一般情况：-ом (如：стол → столом, окно → окном)</li>
                            <li>以-й, -ь, -е(ё)结尾：变-ем/-ём (如：музей → музеем, словарь → словарём, поле → полем)</li>
                            <li>以 ж, ч, ш, щ结尾：加-ем（如：нож → ножом, товарищ → товарищем）</li>
                          </ul>
                        </div>
                        <div class="gender-group">
                          <h6>阴性名词</h6>
                          <ul>
                            <li>以-а结尾：变-ой (如：книга → книгой)</li>
                            <li>以-я结尾：变-ей (如：тетя → тетей)</li>
                            <li>以-ь结尾：加-ю (如：ночь → ночью)</li>
                          </ul>
                        </div>
                      </div>
                      <div class="number-group">
                        <h5>复数形式</h5>
                        <div class="gender-group">
                          <h6>不论性</h6>
                          <ul>
                            <li>一般情况下：加-ами (如：стол → столами)</li>
                            <li>以-й,е,-я,-ь结尾：变-ями (如：музей → музеями, поле → полями, тётя → тётями, учитель → учителями)</li>
                            <li>特殊复数形式ья结尾：-ями （如：друзья（朋友们）→ друзьями, деревья（树木们）→ деревьями</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 6格 -->
                <template v-else-if="selectedDesktopCase === 6">
                  <h3>6格（前置格）</h3>
                  <div class="case-function">
                    <h4>功能</h4>
                    <p>表示地点或状态，通常与前置词连用。</p>
                  </div>
                  <div class="case-endings">
                    <h4>词尾变化</h4>
                    <div class="number-groups-container">
                      <div class="number-group">
                        <h5>单数形式</h5>
                        <div class="gender-group">
                          <h6>不论性</h6>
                          <ul>
                            <li>一般情况下：加-е (如：стол → о столе, город → в городе)<br>特殊：重音移动（如：лес → в лесу́，сад → в саду́，мост → на мосту́，пол → на полу́，шкаф → в шкафу́，берег → на берегу́）</li>
                            <li>阳性-ий、中性-ие、阴性-ия、-ь: 末尾变-и<br>（如：санаторий → в санатории, здание → в здании, станция → на станции, ночь → в ночи）</li>
                          </ul>
                        </div>
                      </div>
                      <div class="number-group">
                        <h5>复数形式</h5>
                        <div class="gender-group">
                          <h6>不分性</h6>
                          <ul>
                            <li>一般情况：-ах (如：стол → столах，место → местах，машина → машинах)</li>
                            <li>以-й,-ь,-я,-е结尾：-ях <br>(如：музей → в музеях, камень → на камнях, неделя → в неделях, море → в морях)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </template>
            <template v-else>
              <div class="default-message">
                <p>点击左侧按钮查看相应规则</p>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div v-else-if="currentPage === 'profile'" class="page-content page-full-width history-page">
        <h2>历史</h2>

        <!-- 历史记录 -->
        <div class="training-history">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3>测试记录</h3>
            <button 
              class="clear-all-btn"
              @click="clearAllHistory"
              style="padding: 0.3rem 0.6rem; background-color: transparent; color: #e74c3c; border: 1px solid #e74c3c; border-radius: 4px; cursor: pointer; font-size: 0.8rem;"
            >
              清空全部
            </button>
          </div>
          <div class="history-list">
            <div 
              v-for="history in trainingHistory.filter((item: TrainingHistoryItem) => item.type === '测试')" 
              :key="history.id"
              class="history-item"
              style="cursor: pointer; position: relative;"
            >
              <div @click="viewHistoryDetails(history)" style="padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div class="history-header">
                    <span class="history-type">{{ history.type }}</span>
                    <span class="history-case" v-if="history.case">{{ history.case }}</span>
                    <span class="history-date">{{ history.date }}</span>
                  </div>
                  <div class="history-details">
                    <span class="history-result">{{ history.correct }} / {{ history.total }}</span>
                    <div class="history-score" :class="{
                      'score-high': history.score >= 90,
                      'score-medium': history.score >= 70 && history.score < 90,
                      'score-low': history.score < 70
                    }">
                      {{ history.score }}分
                    </div>
                  </div>
                </div>
                <button 
                  class="delete-btn"
                  @click.stop="deleteHistory(history.id)"
                  style="padding: 0.2rem 0.4rem; background-color: transparent; color:grey; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;"
                  title="删除"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部栏 -->
    <footer class="footer">
      <button 
        class="footer-btn" 
        :class="{ active: currentPage === 'declension-rules' }"
        @click="navigateTo('declension-rules')"
      >
        <Document class="footer-icon" />
        <span class="footer-text">变格规则</span>
      </button>
      <button 
        class="footer-btn" 
        :class="{ active: currentPage === 'home' }"
        @click="navigateTo('home')"
      >
        <HomeFilled class="footer-icon" />
        <span class="footer-text">主页</span>
      </button>
      <button 
        class="footer-btn" 
        :class="{ active: currentPage === 'profile' }"
        @click="navigateTo('profile')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span class="footer-text">历史</span>
      </button>
    </footer>
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #2c3e50;
  background-color: #f5f7fa;
}

/* 红色末尾字母样式 */
.red-ending {
  color: red;
  font-weight: bold;
}

/* 提示文字样式 */
.hint-text {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1rem;
  text-align: center;
}

/* 可点击目标词样式 */
.clickable-target-word {
  cursor: pointer;
  position: relative;
}

.clickable-target-word:hover {
  text-decoration: none;
}

/* 下拉菜单容器样式 */
.dropdown-container {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  z-index: 1000;
}

/* 下拉菜单样式 */
.dropdown {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  z-index: 1000;
}

/* 词尾选项样式 */
.ending-option {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.ending-option:hover {
  background-color: #f5f5f5;
}

/* 下拉菜单项样式 */
.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1.25rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #2c3e50;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #3498db;
  color: white;
}

/* 应用容器 */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 头部栏样式 */
.header {
  background-color: #ffffff;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: 100%;
  position: relative;
}

.main-title {
  font-size: 2.2rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
  text-transform: uppercase;
}

.sub-title {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0px;
  position: absolute;
  bottom: 0.8rem;
  left: 50%;
  top:68%;
  transform: translateX(-50%);
  width: 100%;
}

/* 内容区样式 */
.content {
  flex: 1;
  padding: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* 移动端页面内容垂直居中 */
@media (max-width: 768px) {
  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .page-content {
    margin-bottom: auto;
  }
}

/* 主页内容 */
.home-content {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 1rem;
}

/* 训练按钮样式 */
.training-btn {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
  text-align: center;
  min-width: 200px;
}

.training-btn:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

/* 页面内容样式 */
.page-content {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.page-content h2 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.4rem;
}

.page-content h3 {
  color: #34495e;
  margin: 1rem 0 0.8rem 0;
  font-size: 1.2rem;
}

.page-content h4 {
  color: #34495e;
  margin: 0.8rem 0 0.5rem 0;
  font-size: 1rem;
}

.page-content p {
  color: #7f8c8d;
  line-height: 1.5;
}

/* 指令文本 */
.instruction {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
}

/* 变格规则页面折叠功能样式 */
.declension-rules {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.case-rule {
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}



.case-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.expand-icon {
  font-size: 0.8rem;
  color: #7f8c8d;
  transition: transform 0.3s ease;
}

.case-content {
  padding: 20px;
}

.case-function {
  margin-bottom: 20px;
}

.case-function h4 {
  margin-bottom: 5px;
  color: #34495e;
  font-size: 1rem;
}

.case-endings h4 {
  margin-bottom: 10px;
  color: #34495e;
  font-size: 1rem;
}

.number-group {
  margin-bottom: 15px;
}

.number-group h5 {
  margin-bottom: 5px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.gender-group {
  margin-bottom: 10px;
}

.gender-group h6 {
  margin-bottom: 5px;
  color: #95a5a6;
  font-size: 0.8rem;
}

.gender-group ul {
  list-style-type: disc;
  margin-left: 20px;
}

.gender-group li {
  margin-bottom: 3px;
  font-size: 0.9rem;
}

/* 格按钮样式 */
.case-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.case-btn {
  padding: 1rem;
  font-size: 1rem;
  font-weight: 500;
  background-color: #ecf0f1;
  color: #2c3e50;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.case-btn:hover {
  background-color: #3498db;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

/* 新手教学样式 */
.tutorial-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  color: #7f8c8d;
}

.back-btn:hover {
  background-color: #ecf0f1;
  color: #2c3e50;
}

.tutorial-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.case-function {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border-left: 3px solid #3498db;
}

.case-endings {
  margin-top: 1rem;
}

.number-group {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.number-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.gender-group {
  margin-bottom: 1.2rem;
}

.ending-example {
  background-color: #f8f9fa;
  padding: 0.8rem;
  border-radius: 6px;
  margin-bottom: 0.8rem;
}

.tutorial-content .case-endings .gender-group .ending-example h5 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #3498db;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.3rem;
}

.tutorial-content .case-endings .gender-group .ending-example p {
  margin: 0.3rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
}

.tutorial-content .case-endings .gender-group .ending-example h5 + h5 {
  margin-top: 1.5rem !important;
  border-top: 1px solid #e0e0e0;
  padding-top: 1rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.3rem;
}

.start-practice-btn {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
  align-self: center;
  margin-top: 0.5rem;
}

.start-practice-btn:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

/* 实战训练样式 */
.practice-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  position: relative;
}

.practice-header h2 {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
}

.practice-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.sentence-container {
  background-color: white;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.sentence {
  font-size: 1rem;
  line-height: 1.5;
  color: #2c3e50;
  margin: 0;
}

/* 电脑端（大屏幕）训练模式字体大小调整 */
@media (min-width: 769px) {
  .sentence {
    font-size: 1.2rem;
  }
}

.sentence strong {
  color: #3498db;
  position: relative;
}

.word-selection {
  display: flex;
  justify-content: center;
  margin: 0.5rem 0;
}

.target-word-container {
  display: flex;
  align-items: baseline;
  background-color: white;
  padding: 0.8rem;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.target-word-base {
  font-size: 1.2rem;
  font-weight: 500;
  color: #2c3e50;
}

.ending-selector {
  position: relative;
  margin-left: 0.3rem;
}

.current-ending {
  font-size: 1.2rem;
  font-weight: 500;
  color: #e74c3c;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.current-ending:hover {
  background-color: #f8f9fa;
}

.current-ending.selected {
  background-color: #3498db;
  color: white;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #ecf0f1;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 0.2rem;
  min-width: 80px;
}

.ending-option {
  padding: 0.5rem 0.8rem;
  font-size: 0.9rem;
  color: #2c3e50;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;
}

.ending-option:hover {
  background-color: #f8f9fa;
}

.ending-option:first-child {
  border-radius: 6px 6px 0 0;
}

.ending-option:last-child {
  border-radius: 0 0 6px 6px;
}

/* 提交按钮样式 */
.submit-btn {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
  align-self: center;
  min-width: 120px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.4);
}

.submit-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 结果容器样式 */
.result-container {
  background-color: white;
  padding: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.result-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.result-icon.correct {
  background-color: #27ae60;
  color: white;
}

.result-icon.incorrect {
  background-color: #e74c3c;
  color: white;
}

.result-message {
  text-align: center;
  max-width: 400px;
}

.correct-message {
  font-size: 1.1rem;
  font-weight: 500;
  color: #27ae60;
  margin: 0 0 0.5rem 0;
}

.incorrect-message {
  font-size: 1.1rem;
  font-weight: 500;
  color: #e74c3c;
  margin: 0 0 0.5rem 0;
}

.explanation {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #7f8c8d;
  margin: 0.3rem 0;
}

.next-btn {
  padding: 0.7rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
}

.next-btn:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.4);
}

/* 测试样式 */
.test-content {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.question-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.question-number {
  font-size: 0.9rem;
  font-weight: 500;
  color: #2c3e50;
}

.timer {
  font-size: 0.9rem;
  font-weight: 600;
  color: #3498db;
  padding: 0.3rem 0.8rem;
  background-color: #ecf0f1;
  border-radius: 4px;
}

.timer.warning {
  color: #e74c3c;
  background-color: #ffe6e6;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.answer-card-btn {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  background-color: #ecf0f1;
  color: #2c3e50;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.answer-card-btn:hover {
  background-color: #3498db;
  color: white;
}

.answer-card {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.answer-card h3 {
  font-size: 1rem;
  margin-bottom: 0.8rem;
  color: #2c3e50;
}

.answer-card-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.5rem;
}

.card-item {
  padding: 0.5rem;
  font-size: 0.8rem;
  background-color: white;
  color: #2c3e50;
  border: 1px solid #ecf0f1;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.card-item:hover {
  background-color: #ecf0f1;
  border-color: #3498db;
}

.card-item.current {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.card-item.correct {
  background-color: #27ae60;
  color: white;
  border-color: #27ae60;
}

.card-item.incorrect {
  background-color: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

.card-item.unanswered {
  background-color: white;
  color: #2c3e50;
  border-color: #ecf0f1;
}

.question-container {
  background-color: white;
  padding: 1.2rem;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.question-text {
  font-size: 1rem;
  line-height: 1.5;
  color: #2c3e50;
  margin: 0;
}

.question-text strong {
  color: #3498db;
  position: relative;
}

.underline-blank {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
  color: #7f8c8d;
  display: inline-block;
  min-width: 100px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0.5rem 0;
}

.option-btn {
  padding: 0.8rem 1.2rem;
  font-size: 0.9rem;
  text-align: left;
  background-color: white;
  color: #2c3e50;
  border: 1px solid #ecf0f1;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.option-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #3498db;
  transform: translateX(4px);
}

.option-btn.selected:hover:not(:disabled) {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
  transform: translateX(4px);
}

.option-btn.selected {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.option-btn.correct {
  background-color: #27ae60;
  color: white;
  border-color: #27ae60;
}

.option-btn.incorrect {
  background-color: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

.option-btn:disabled {
  cursor: not-allowed;
}

.test-result {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.result-explanation {
  font-size: 0.9rem;
  line-height: 1.4;
  color: #7f8c8d;
  text-align: center;
  margin: 0;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.nav-btn {
  padding: 0.7rem 1.2rem;
  font-size: 0.9rem;
  background-color: #ecf0f1;
  color: #2c3e50;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  background-color: #3498db;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.nav-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.nav-btn.next-btn {
  background-color: #3498db;
  color: white;
}

.nav-btn.next-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.nav-btn.submit-btn {
  background-color: #27ae60;
  color: white;
}

.nav-btn.submit-btn:hover:not(:disabled) {
  background-color: #229954;
}

.test-completed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.test-completed h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0;
}

.score-container {
  background-color: white;
  padding: 1.2rem 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.score {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3498db;
}

.test-summary {
  width: 100%;
  background-color: white;
  padding: 1.2rem;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.test-summary h4 {
  margin-top: 0;
  margin-bottom: 0.8rem;
  color: #2c3e50;
  font-size: 1rem;
}

.answer-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.summary-item:hover {
  background-color: #ecf0f1;
  transform: translateX(4px);
}

.summary-question-number {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.summary-status {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.summary-status.correct {
  background-color: #27ae60;
  color: white;
}

.summary-status.incorrect {
  background-color: #e74c3c;
  color: white;
}

.summary-status.unanswered {
  background-color: #f39c12;
  color: white;
}

.restart-btn {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.restart-btn:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

/* 变格规则样式 */
.declension-rules {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.case-rule {
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.case-rule:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.case-rule h3 {
  color: #3498db;
  margin-top: 0;
  font-size: 1.1rem;
  padding-bottom: 0.5rem;
}

.case-function {
  margin-bottom: 0.8rem;
}

.case-function h4 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 0.3rem;
  font-size: 1rem;
}

.case-function p {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
}

.case-endings {
  margin-top: 0.8rem;
}

.case-endings h4 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 0.8rem;
  font-size: 1rem;
}

.gender-group {
  margin-bottom: 1rem;
}

.gender-group h5 {
  color: #34495e;
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.gender-group ul {
  margin: 0;
  padding-left: 1.2rem;
  color: #7f8c8d;
}

.gender-group li {
  margin-bottom: 0.6rem;
  line-height: 1.5;
  font-size: 0.85rem;
  text-align: left;
}

/* 个人中心样式 */
.profile-stats {
  background-color: #f8f9fa;
  padding: 1.2rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.profile-stats h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  background-color: white;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3498db;
}

.stat-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  text-align: center;
}

.training-history {
  background-color: #f8f9fa;
  padding: 1.2rem;
  border-radius: 6px;
}

.training-history h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.history-item {
  padding: 1rem;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.history-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.history-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.history-type {
  font-weight: 500;
  color: #2c3e50;
  background-color: #3498db;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.history-case {
  font-size: 0.75rem;
  color: #7f8c8d;
  background-color: #ecf0f1;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
}

.history-date {
  font-size: 0.75rem;
  color: #95a5a6;
  margin-left: auto;
}

.history-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-result {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.history-score {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
}

.history-score.score-high {
  background-color: #27ae60;
  color: white;
}

.history-score.score-medium {
  background-color: #f39c12;
  color: white;
}

.history-score.score-low {
  background-color: #e74c3c;
  color: white;
}

/* 底部栏样式 */
.footer {
  background-color: #ffffff;
  padding: 0.8rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  bottom: 0;
  width: 100%;
}

.footer-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #7f8c8d;
  flex: 1;
}

.footer-btn.active {
  color: #3498db;
}

.footer-btn:hover {
  color: #3498db;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.footer-icon {
  font-size: 0.8rem;
  width: 24px;
  height: 24px;
  margin-bottom: 0.2rem;
  display: inline-block;
}

.footer-text {
  font-size: 0.7rem;
}

/* 响应式设计 */
@media (min-width: 768px) {
  /* 应用容器 - 大屏幕限制在视窗内 */
  .app-container {
    height: 100vh;
    overflow: hidden;
  }

  /* 头部样式 */
  .header {
    padding: 2rem;
    flex-shrink: 0;
  }

  .main-title {
    font-size: 2.2rem;
    margin-bottom: 0.3rem;
  }

  .sub-title {
    font-size: 0.95rem;
  }

  /* 内容样式 - 可滚动 */
  .content {
    padding: 1.5rem 2rem;
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .content::-webkit-scrollbar {
    display: none;
  }

  /* 主页样式 */
  .home-content {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
  }

  .training-btn {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    min-width: 250px;
  }

  /* 页面内容样式 */
  .page-content {
    padding: 1.5rem 2rem;
    max-width: 900px;
    margin: 0 auto;
  }

  /* 历史页面内容容器 - flex布局 */
  .page-content.history-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem 2rem;
    max-width: none;
  }

  .page-content.history-page h2 {
    flex-shrink: 0;
  }

  .page-content h2 {
    font-size: 1.4rem;
    margin-bottom: 0.5rem;
  }

  /* 格按钮样式 */
  .case-buttons {
    grid-template-columns: repeat(5, 1fr);
  }

  /* 下拉菜单样式 - 限制高度，防止遮挡 */
  .dropdown {
    max-height: 200px;
    overflow-y: auto;
  }

  .dropdown-item {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  /* 结果容器样式 - 更紧凑 */
  .result-container {
    padding: 1rem;
    gap: 0.6rem;
  }

  .result-icon {
    font-size: 1.5rem;
    width: 45px;
    height: 45px;
    margin-bottom: 0.3rem;
  }

  .result-message {
    max-width: 500px;
  }

  .correct-message,
  .incorrect-message {
    font-size: 1rem;
  }

  .explanation {
    font-size: 0.85rem;
    line-height: 1.4;
  }

  /* 测试页面和变格规则 - 更宽的布局 */
  .test-content {
    max-width: 700px;
    margin: 0 auto;
  }

  .options-container {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  .option-btn {
    flex: 1 1 calc(50% - 0.4rem);
    min-width: 200px;
  }

  /* 测试样式 */
  .answer-card-grid {
    grid-template-columns: repeat(10, 1fr);
  }

  /* 个人中心样式 */
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  /* 移动端/桌面端显示控制 */
  .mobile-only {
    display: none !important;
  }

  .desktop-only {
    display: flex !important;
  }

  /* 变格规则页面 - 桌面端 */
  .page-full-width {
    max-width: none !important;
    width: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .page-full-width h2 {
    margin-top: 0;
    flex-shrink: 0;
  }

  .page-full-width .instruction {
    margin-bottom: 1rem;
    flex-shrink: 0;
  }

  /* 指定格训练页面 - 桌面端 */
  .page-full-width .case-select-container,
  .page-full-width .tutorial-container,
  .page-full-width .practice-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .page-full-width .tutorial-header,
  .page-full-width .practice-header {
    flex-shrink: 0;
    margin-bottom: 0.6rem;
  }

  .page-full-width .case-buttons {
    margin-top: 0.8rem;
    flex-shrink: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding:0 15rem;
  }

  .page-full-width .case-select-container {
    justify-content: center;
  }

  .page-full-width .tutorial-content,
  .page-full-width .practice-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0.6rem;
  }

  .page-full-width .practice-content {
    padding: 0.7rem;
    gap: 0.7rem;
  }

  .page-full-width .practice-content .sentence-container {
    padding: 0.7rem;
  }

  .page-full-width .practice-content .result-container {
    padding: 0.8rem;
    gap: 0.5rem;
  }

  .page-full-width .practice-content .result-icon {
    font-size: 1.4rem;
    width: 42px;
    height: 42px;
    margin-bottom: 0.2rem;
  }

  .page-full-width .practice-content .correct-message,
  .page-full-width .practice-content .incorrect-message {
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }

  .page-full-width .practice-content .explanation {
    font-size: 0.85rem;
    line-height: 1.4;
    margin: 0.25rem 0;
  }

  .page-full-width .practice-content .next-btn {
    padding: 0.6rem 1.1rem;
    font-size: 0.85rem;
  }

  .page-full-width .practice-content .hint-text {
    margin-bottom: 0.6rem;
    font-size: 0.85rem;
  }

  .declension-rules-desktop {
    flex: 1;
    min-height: 0;
    display: flex;
    overflow: hidden;
  }

  .declension-rules-desktop .rules-sidebar {
    padding: 0.6rem 0;
    flex-shrink: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .declension-rules-desktop .case-sidebar-btn {
    padding: 0.6rem 0.8rem !important;
    font-size: 0.9rem !important;
    border-radius: 6px !important;
  }

  .declension-rules-desktop .case-sidebar-btn:hover {
    transform: none !important;
  }

  .declension-rules-desktop .rules-content {
    padding: 0.5rem 1.5rem;
    overflow-y: auto;
    flex: 1;
    min-width: 0;
    scrollbar-width: thin;
    scrollbar-color: #3498db #e9ecef;
  }

  .declension-rules-desktop .rules-content::-webkit-scrollbar {
    width: 6px;
  }

  .declension-rules-desktop .rules-content::-webkit-scrollbar-track {
    background: #e9ecef;
    border-radius: 10px;
  }

  .declension-rules-desktop .rules-content::-webkit-scrollbar-thumb {
    background-color: #3498db;
    border-radius: 10px;
    border: 1px solid #e9ecef;
  }

  .declension-rules-desktop .rules-content::-webkit-scrollbar-thumb:hover {
    background-color: #2980b9;
  }

  /* 电脑端变格规则内容优化 */
  .declension-rules-desktop .case-function {
    margin-bottom: 1rem;
  }

  .declension-rules-desktop .case-function h4 {
    font-size: 1.1rem;
    margin-bottom: 0.4rem;
  }

  .declension-rules-desktop .case-function p {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .declension-rules-desktop .case-endings {
    margin-top: 1rem;
  }

  .declension-rules-desktop .case-endings h4 {
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
  }

  .declension-rules-desktop .number-group {
    margin-bottom: 1rem;
  }

  .declension-rules-desktop .number-group h5 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    color: #3498db;
  }

  .declension-rules-desktop .gender-group {
    margin-bottom: 0.7rem;
    padding: 0.6rem;
    background-color: #f8f9fa;
    border-radius: 6px;
  }

  .declension-rules-desktop .gender-group h6 {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
    color: #2c3e50;
  }

  .declension-rules-desktop .gender-group ul {
    margin: 0;
    padding-left: 1.2rem;
  }

  .declension-rules-desktop .gender-group li {
    font-size: 0.85rem;
    line-height: 1.6;
    margin-bottom: 0.3rem;
  }

  /* 电脑端：单数和复数形式并排显示 */
  .declension-rules-desktop .case-endings {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .declension-rules-desktop .number-groups-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1rem;
  }

  /* 总结页面 - 桌面端 */
  .test-completed {
    max-width: 800px;
    margin: 0 auto;
    padding: 0.8rem;
    gap: 0.8rem;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .test-completed::-webkit-scrollbar {
    display: none;
  }

  .test-completed h3 {
    font-size: 1rem;
    margin-bottom: 0;
  }

  .score-container {
    padding: 0.6rem 1.2rem;
  }

  .score {
    font-size: 1.1rem;
  }

  .test-summary {
    padding: 0.6rem;
  }

  .test-summary h4 {
    font-size: 0.85rem;
    margin-bottom: 0.4rem;
  }

  .answer-summary {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.4rem;
  }

  .summary-item {
    padding: 0.4rem;
  }

  .summary-question-number {
    font-size: 0.75rem;
  }

  .summary-status {
    padding: 0.15rem 0.4rem;
    font-size: 0.65rem;
  }

  .restart-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  /* 测试页面 - 桌面端优化 */
  .test-content {
    gap: 0.8rem;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .test-content::-webkit-scrollbar {
    display: none;
  }

  .question-navigation {
    margin-bottom: 0.3rem;
  }

  .question-number,
  .timer {
    font-size: 0.85rem;
  }

  .question-container {
    padding: 0.8rem;
  }

  .question-text {
    font-size: 0.95rem;
  }

  .options-container {
    gap: 0.4rem;
    margin: 0.3rem 0;
  }

  .option-btn {
    padding: 0.6rem 0.9rem;
    font-size: 0.85rem;
  }

  .test-result {
    padding: 0.8rem;
    gap: 0.6rem;
  }

  .result-icon {
    font-size: 1.5rem;
    width: 45px;
    height: 45px;
    margin-bottom: 0.3rem;
  }

  .result-explanation {
    font-size: 0.85rem;
  }

  .nav-buttons {
    gap: 0.5rem;
  }

  .nav-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  /* 隐藏滚动条 - 所有页面 */
  .app-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .app-container::-webkit-scrollbar {
    display: none;
  }

  .page-content:not(.history-page) {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .page-content:not(.history-page)::-webkit-scrollbar {
    display: none;
  }

  /* 历史页面 - 允许滚动条 */
  .page-content.history-page {
    -ms-overflow-style: auto;
    scrollbar-width: auto;
  }

  .page-content.history-page::-webkit-scrollbar {
    display: auto;
  }

  /* 历史页面 - 桌面端 */
  .training-history {
    max-width: none;
    margin: 0;
    width: 100%;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    scrollbar-width: thin;
  }

  .training-history::-webkit-scrollbar {
    width: 6px;
  }

  .training-history::-webkit-scrollbar-track {
    background: #e9ecef;
    border-radius: 10px;
  }

  .training-history::-webkit-scrollbar-thumb {
    background-color: #3498db;
    border-radius: 10px;
    border: 1px solid #e9ecef;
  }

  .history-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .history-item {
    margin-bottom: 0;
  }
}

@media (min-width: 1200px) {
  /* 应用容器 */
  .app-container {
    height: 100vh;
    overflow: hidden;
  }

  /* 内容样式 - 隐藏滚动条 */
  .content {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .content::-webkit-scrollbar {
    display: none;
  }

  /* 历史页面内容容器 - flex布局 */
  .page-content.history-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem 2rem;
    max-width: none;
  }

  .page-content.history-page h2 {
    flex-shrink: 0;
  }

  /* 历史页面 - 更大屏幕 */
  .training-history {
    max-width: none;
    margin: 0;
    width: 100%;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    scrollbar-width: thin;
  
  }

  .training-history::-webkit-scrollbar {
    width: 6px;
  }

  .training-history::-webkit-scrollbar-track {
    background: #e9ecef;
    border-radius: 10px;
  }

  .training-history::-webkit-scrollbar-thumb {
    background-color: #3498db;
    border-radius: 10px;
    border: 1px solid #e9ecef;
  }

  /* 头部样式 */
  .header {
    padding: 2rem;
  }

  .main-title {
    font-size: 2.2rem;
  }

  /* 主页样式 */
  .home-content {
    gap: 2rem;
  }

  .training-btn {
    padding: 1rem 2.5rem;
    font-size: 1.15rem;
    min-width: 280px;
  }

  /* 页面内容样式 - 更宽的最大宽度 */
  .page-content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  /* 测试页面 - 更宽 */
  .test-content {
    max-width: 800px;
  }

  .option-btn {
    flex: 1 1 calc(50% - 0.4rem);
  }

  /* 下拉菜单样式 */
  .dropdown {
    max-height: 180px;
  }

  /* 统计样式 */
  .stats-grid {
    gap: 1.2rem;
  }

  .stat-item {
    padding: 1.2rem;
  }

  .stat-value {
    font-size: 1.6rem;
  }

  /* 变格规则页面 - 确保完整显示 */
  .page-full-width {
    display: flex;
    flex-direction: column;
    padding: 1rem 1.5rem;
    height: 100%;
    overflow: hidden;
  }

  .page-full-width h2 {
    margin-top: 0;
    flex-shrink: 0;
  }

  .page-full-width .instruction {
    margin-bottom: 1rem;
    flex-shrink: 0;
  }

  .declension-rules-desktop {
    flex: 1;
    min-height: 0;
    display: flex;
    overflow: hidden;
  }

  .declension-rules-desktop .rules-sidebar {
    flex-shrink: 0;
    padding: 0.6rem 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .declension-rules-desktop .case-sidebar-btn {
    padding: 0.6rem 0.8rem !important;
    font-size: 0.9rem !important;
    border-radius: 6px !important;
  }

  .declension-rules-desktop .case-sidebar-btn:hover {
    transform: none !important;
  }

  .declension-rules-desktop .rules-content {
    padding: 0.5rem 1.5rem;
    overflow-y: auto;
    flex: 1;
    min-width: 0;
    scrollbar-width: thin;
    scrollbar-color: #3498db #e9ecef;
  }

  .declension-rules-desktop .rules-content::-webkit-scrollbar {
    width: 6px;
  }

  .declension-rules-desktop .rules-content::-webkit-scrollbar-track {
    background: #e9ecef;
    border-radius: 10px;
  }

  .declension-rules-desktop .rules-content::-webkit-scrollbar-thumb {
    background-color: #3498db;
    border-radius: 10px;
    border: 1px solid #e9ecef;
  }

  .declension-rules-desktop .rules-content::-webkit-scrollbar-thumb:hover {
    background-color: #2980b9;
  }

  /* 总结页面 - 更大屏幕 */
  .test-completed {
    max-width: 900px;
    padding: 0.8rem;
    gap: 0.8rem;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .test-completed::-webkit-scrollbar {
    display: none;
  }

  .test-completed h3 {
    font-size: 1rem;
    margin-bottom: 0;
  }

  .score-container {
    padding: 0.6rem 1.2rem;
  }

  .score {
    font-size: 1.1rem;
  }

  .test-summary {
    padding: 0.6rem;
  }

  .test-summary h4 {
    font-size: 0.85rem;
    margin-bottom: 0.4rem;
  }

  .answer-summary {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.4rem;
  }

  .summary-item {
    padding: 0.4rem;
  }

  .summary-question-number {
    font-size: 0.75rem;
  }

  .summary-status {
    padding: 0.15rem 0.4rem;
    font-size: 0.65rem;
  }

  .restart-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  /* 测试页面 - 更大屏幕优化 */
  .test-content {
    gap: 0.8rem;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .test-content::-webkit-scrollbar {
    display: none;
  }

  .question-navigation {
    margin-bottom: 0.3rem;
  }

  .question-number,
  .timer {
    font-size: 0.85rem;
  }

  .question-container {
    padding: 0.8rem;
  }

  .question-text {
    font-size: 0.95rem;
  }

  .options-container {
    gap: 0.4rem;
    margin: 0.3rem 0;
  }

  .option-btn {
    padding: 0.6rem 0.9rem;
    font-size: 0.85rem;
  }

  .test-result {
    padding: 0.8rem;
    gap: 0.6rem;
  }

  .result-icon {
    font-size: 1.5rem;
    width: 45px;
    height: 45px;
    margin-bottom: 0.3rem;
  }

  .result-explanation {
    font-size: 0.85rem;
  }

  .nav-buttons {
    gap: 0.5rem;
  }

  .nav-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  /* 隐藏滚动条 - 所有页面 */
  .app-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .app-container::-webkit-scrollbar {
    display: none;
  }

  .page-content:not(.history-page) {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .page-content:not(.history-page)::-webkit-scrollbar {
    display: none;
  }

  /* 历史页面 - 允许滚动条 */
  .page-content.history-page {
    -ms-overflow-style: auto;
    scrollbar-width: auto;
  }

  .page-content.history-page::-webkit-scrollbar {
    display: auto;
  }

  /* 历史页面 - 更大屏幕 */
  .history-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  /* 头部样式 */
  .header {
    padding: 1.5rem 1rem 2.5rem;
  }
  
  .main-title {
    font-size: 1.8rem;
  }
  .sub-title {
   top:65%;
  }
  
  /* 内容样式 */
  .content {
    padding: 1rem;
  }
  
  /* 页面内容样式 */
  .page-content {
    padding: 1rem;
  }
  
  /* 格按钮样式 */
  .case-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* 测试样式 */
  .answer-card-grid {
    grid-template-columns: repeat(5, 1fr);
  }
  
  .nav-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  /* 统计样式 */
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  /* 历史样式 */
  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .history-date {
    margin-left: 0;
  }
  
  .history-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-title {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.modal-text {
  font-size: 1rem;
  color: #34495e;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modal-btn {
  padding: 0.7rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn-no {
  background-color: #ecf0f1;
  color: #34495e;
}

.modal-btn-no:hover {
  background-color: #bdc3c7;
}

.modal-btn-yes {
  background-color: #3498db;
  color: white;
}

.modal-btn-yes:hover {
  background-color: #2980b9;
}

/* 移动端/桌面端显示控制 */
.mobile-only {
  display: block;
}

.desktop-only {
  display: none;
}

/* 变格规则 - 桌面端左右布局 */
.declension-rules-desktop {
  gap: 1.5rem;
  height: 100%;
}

.rules-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  min-width: 120px;
  padding-right: 1rem;
  border-right: 1px solid #e0e0e0;
}

.case-sidebar-btn {
  padding: 0.8rem 1rem;
  border: 1px solid #3498db;
  background-color: white;
  color: #3498db;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.case-sidebar-btn:hover {
  background-color: #e8f4fc;
  transform: translateY(-2px);
}

.case-sidebar-btn.active {
  background-color: #3498db;
  color: white;
}

.rules-content {
  flex: 1;
  padding: 0 1rem;
  overflow-y: auto;
}

.rules-content h3 {
  color: #3498db;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #3498db;
}

.desktop-case-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.default-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #95a5a6;
  font-size: 1.1rem;
}

.default-message p {
  text-align: center;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>