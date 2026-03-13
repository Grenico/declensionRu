<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { HomeFilled, Document, ArrowLeft, Clock } from '@element-plus/icons-vue'

// 当前选中的页面
const currentPage = ref('home')
const previousPage = ref('home') // 保存之前的页面状态，用于恢复会话



// 更新公告弹窗显示状态 - 从localStorage读取
const showUpdateModal = ref(localStorage.getItem('hideUpdateModal') !== 'true')

// 关闭更新公告弹窗
const closeUpdateModal = () => {
  showUpdateModal.value = false
  localStorage.setItem('hideUpdateModal', 'true')
}

// 页面导航历史记录栈
const navigationHistory = ref<string[]>(['home']) // 初始只有主页
const historyIndex = ref(0) // 当前在历史记录中的索引

// 指定格训练相关状态
const caseTrainingState = ref('select-case') // select-case, tutorial, practice
const selectedCase = ref<number | null>(null)

// 形容词训练和物主代词训练状态
const adjPossTrainingState = ref('select-gender') // select-gender, practice
const selectedGender = ref<string | null>(null) // 阳性/中性、阴性、复数
const currentAdjPossType = ref<string>('') // 区分是形容词训练还是物主代词训练

// 人称代词训练状态（已在其他位置声明）
// const pronounTrainingState = ref('select-person') // select-person, practice
// const selectedPerson = ref<string | null>(null) // 单数人称、复数人称
const currentPersonalPronounSentence = ref<any>(null)
const personalPronounSelectedEnding = ref('')
const personalPronounShowDropdown = ref(false)
const personalPronounAnswerResult = ref<string | null>(null)
const personalPronounShowResult = ref(false)
const usedPersonalPronounSentences = ref<number[]>([])

// 形容词+名词组合训练状态
const adjNounCombinedState = ref('practice') // practice
const currentAdjNounSentence = ref<any>(null)
const adjNounSelectedAdjective = ref('')
const adjNounSelectedNoun = ref('')
const adjNounShowDropdown = ref<'adjective' | 'noun' | null>(null)
const adjNounDropdownTop = ref(0)
const adjNounDropdownLeft = ref(0)
const adjNounShowResult = ref(false)
const adjNounAnswerResult = ref<string | null>(null)
const usedAdjNounSentences = ref<number[]>([])
const adjNounCaseFilter = ref<number | null>(null) // 格筛选，null表示不限制
const adjNounShowFilterDropdown = ref(false)

// 物主代词+名词组合训练状态
const possNounCombinedState = ref('practice') // practice
const currentPossNounSentence = ref<any>(null)
const possNounSelectedPronoun = ref('')
const possNounSelectedNoun = ref('')
const possNounShowDropdown = ref<'pronoun' | 'noun' | null>(null)
const possNounDropdownTop = ref(0)
const possNounDropdownLeft = ref(0)
const possNounShowResult = ref(false)
const possNounAnswerResult = ref<string | null>(null)
const usedPossNounSentences = ref<number[]>([])
const possNounCaseFilter = ref<number | null>(null) // 格筛选，null表示不限制
const possNounShowFilterDropdown = ref(false)

// 数词+名词组合训练状态
const numNounCombinedState = ref('practice') // practice
const currentNumNounSentence = ref<any>(null)
const numNounSelectedNumeral = ref('')
const numNounSelectedNoun = ref('')
const numNounShowDropdown = ref<'numeral' | 'noun' | null>(null)
const numNounDropdownTop = ref(0)
const numNounDropdownLeft = ref(0)
const numNounShowResult = ref(false)
const numNounAnswerResult = ref<string | null>(null)
const usedNumNounSentences = ref<number[]>([])
const numNounCaseFilter = ref<number | null>(null) // 格筛选，null表示不限制
const numNounShowFilterDropdown = ref(false)

// 形容词训练题目数据
const adjectiveTrainingSentences = ref<Array<{
  id: number
  text: string
  targetWord: string
  originalEnding: string
  correctEnding: string
  possibleEndings: string[]
  explanation: string
  case: number
  gender: string
}>>([
  // 阳性/中性训练题目
  {
    id: 1,
    text: 'Это большой дом.',
    targetWord: 'большой',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ого', 'ому', 'ым'],
    explanation: '1格，阳性形容词不变。',
    case: 1,
    gender: '阳性'
  },
  {
    id: 2,
    text: 'Здесь вкусный кофе.',
    targetWord: 'вкусный',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ого', 'ому', 'ым'],
    explanation: '1格，阳性形容词不变。',
    case: 1,
    gender: '阳性'
  },
  {
    id: 3,
    text: 'Наступил холодный вечер.',
    targetWord: 'холодный',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ого', 'ому', 'ым'],
    explanation: '1格，阳性形容词不变。',
    case: 1,
    gender: '阳性'
  },
  {
    id: 4,
    text: 'Это современный город.',
    targetWord: 'современный',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ого', 'ому', 'ым'],
    explanation: '1格，阳性形容词不变。',
    case: 1,
    gender: '阳性'
  },
  {
    id: 5,
    text: 'Мой любимый фильм начинается.',
    targetWord: 'любимый',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ого', 'ому', 'ым'],
    explanation: '1格，阳性形容词不变。',
    case: 1,
    gender: '阳性'
  },
  {
    id: 6,
    text: 'Это интересный журнал.',
    targetWord: 'интересный',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ого', 'ому', 'ым'],
    explanation: '1格，阳性形容词不变。',
    case: 1,
    gender: '阳性'
  },
  {
    id: 7,
    text: 'У меня есть новый телефон.',
    targetWord: 'новый',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ого', 'ому', 'ым'],
    explanation: '1格，阳性形容词不变。',
    case: 1,
    gender: '阳性'
  },
  {
    id: 8,
    text: 'Это высокий здание.',
    targetWord: 'высокий',
    originalEnding: '',
    correctEnding: 'ое',
    possibleEndings: ['ое', 'ого', 'ому', 'ым'],
    explanation: '1格，中性形容词词尾为-ое。',
    case: 1,
    gender: '中性'
  },
  {
    id: 9,
    text: 'У меня нет новый телефона.',
    targetWord: 'новый',
    originalEnding: '',
    correctEnding: 'ого',
    possibleEndings: ['ого', '/', 'ому', 'ым'],
    explanation: '2格，阳性形容词词尾为-ого。',
    case: 2,
    gender: '阳性'
  },
  {
    id: 10,
    text: 'У него нет свободный времени.',
    targetWord: 'свободный',
    originalEnding: '',
    correctEnding: 'ого',
    possibleEndings: ['ого', '/', 'ому', 'ым'],
    explanation: '2格，中性形容词词尾为-ого。',
    case: 2,
    gender: '中性'
  },
  {
    id: 11,
    text: 'У нас нет горячий чая.',
    targetWord: 'горячий',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', 'ого', 'ому', '/'],
    explanation: '2格，阳性形容词（г,к,х后）词尾为-его。',
    case: 2,
    gender: '阳性'
  },
  {
    id: 12,
    text: 'Я не вижу белый снега.',
    targetWord: 'белый',
    originalEnding: '',
    correctEnding: 'ого',
    possibleEndings: ['ого', '/', 'ому', 'ым'],
    explanation: '2格，阳性形容词词尾为-ого。',
    case: 2,
    gender: '阳性'
  },
  {
    id: 13,
    text: 'В парке нет высокий дерева.',
    targetWord: 'высокий',
    originalEnding: '',
    correctEnding: 'ого',
    possibleEndings: ['ого', '/', 'ому', 'ым'],
    explanation: '2格，中性形容词词尾为-ого。',
    case: 2,
    gender: '中性'
  },
  {
    id: 14,
    text: 'У меня нет свежий хлеба.',
    targetWord: 'свежий',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', 'ого', 'ому', '/'],
    explanation: '2格，阳性形容词（ж后）词尾为-его。',
    case: 2,
    gender: '阳性'
  },
  {
    id: 15,
    text: 'Мы ждем приезда дорогой гостя.',
    targetWord: 'дорогой',
    originalEnding: '',
    correctEnding: 'ого',
    possibleEndings: ['ого', '/', 'ому', 'ым'],
    explanation: '2格，阳性形容词词尾为-ого。',
    case: 2,
    gender: '阳性'
  },
  {
    id: 16,
    text: 'У нее нет чистый воздуха.',
    targetWord: 'чистый',
    originalEnding: '',
    correctEnding: 'ого',
    possibleEndings: ['ого', '/', 'ому', 'ым'],
    explanation: '2格，阳性形容词词尾为-ого。',
    case: 2,
    gender: '阳性'
  },
  {
    id: 17,
    text: 'Я подошел к высокий зданию.',
    targetWord: 'высокий',
    originalEnding: '',
    correctEnding: 'ому',
    possibleEndings: ['ому', 'ого', '/', 'ым'],
    explanation: '3格，中性形容词词尾为-ому。',
    case: 3,
    gender: '中性'
  },
  {
    id: 18,
    text: 'Я еду к старый другу.',
    targetWord: 'старый',
    originalEnding: '',
    correctEnding: 'ому',
    possibleEndings: ['ому', 'ого', '/', 'ым'],
    explanation: '3格，阳性形容词词尾为-ому。',
    case: 3,
    gender: '阳性'
  },
  {
    id: 19,
    text: 'Мы готовимся к трудный экзамену.',
    targetWord: 'трудный',
    originalEnding: '',
    correctEnding: 'ому',
    possibleEndings: ['ому', 'ого', 'ному', '/'],
    explanation: '3格，阳性形容词词尾为-ому。',
    case: 3,
    gender: '阳性'
  },
  {
    id: 20,
    text: 'Он относится к важный вопросу.',
    targetWord: 'важный',
    originalEnding: '',
    correctEnding: 'ому',
    possibleEndings: ['ому', 'ого', 'ному', '/'],
    explanation: '3格，阳性形容词词尾为-ому。',
    case: 3,
    gender: '阳性'
  },
  {
    id: 21,
    text: 'Я завидую удачливый человеку.',
    targetWord: 'удачливый',
    originalEnding: '',
    correctEnding: 'ому',
    possibleEndings: ['ому', 'ого', '/', 'ым'],
    explanation: '3格，阳性形容词词尾为-ому。',
    case: 3,
    gender: '阳性'
  },
  {
    id: 22,
    text: 'Мы идем по широкий проспекту.',
    targetWord: 'широкий',
    originalEnding: '',
    correctEnding: 'ому',
    possibleEndings: ['ому', 'ого', '/', 'ым'],
    explanation: '3格，阳性形容词词尾为-ому。',
    case: 3,
    gender: '阳性'
  },
  {
    id: 23,
    text: 'Он подошел к открытый окну.',
    targetWord: 'открытый',
    originalEnding: '',
    correctEnding: 'ому',
    possibleEndings: ['ому', 'ого', '/', 'ым'],
    explanation: '3格，中性形容词词尾为-ому。',
    case: 3,
    gender: '中性'
  },
  {
    id: 24,
    text: 'Дети рады новый году.',
    targetWord: 'новый',
    originalEnding: '',
    correctEnding: 'ому',
    possibleEndings: ['ому', 'ого', '/', 'ым'],
    explanation: '3格，阳性形容词词尾为-ому。',
    case: 3,
    gender: '阳性'
  },
  {
    id: 25,
    text: 'Я вижу красивый парк.',
    targetWord: 'красивый',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ого', 'ому', 'ым'],
    explanation: '4格非动物，阳性形容词不变。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 26,
    text: 'Я купил синий костюм.',
    targetWord: 'синий',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ого', 'ому', 'ым'],
    explanation: '4格非动物，阳性形容词不变。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 27,
    text: 'Он потерял старый ключ.',
    targetWord: 'старый',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ого', 'ому', 'ым'],
    explanation: '4格非动物，阳性形容词不变。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 28,
    text: 'Она надела красный плащ.',
    targetWord: 'красный',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ого', 'ому', 'ым'],
    explanation: '4格非动物，阳性形容词不变。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 29,
    text: 'Я люблю русский язык.',
    targetWord: 'русский',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ого', 'ому', 'ым'],
    explanation: '4格非动物，阳性形容词不变。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 30,
    text: 'Мы ждем новый автобус.',
    targetWord: 'новый',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ого', 'ому', 'ым'],
    explanation: '4格非动物，阳性形容词不变。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 31,
    text: 'Я встретил старый друга.',
    targetWord: 'старый',
    originalEnding: '',
    correctEnding: 'ого',
    possibleEndings: ['ого', '/', 'ому', 'ым'],
    explanation: '4格动物，阳性形容词词尾为-ого（同2格）。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 32,
    text: 'Она ждет любимый человека.',
    targetWord: 'любимый',
    originalEnding: '',
    correctEnding: 'ого',
    possibleEndings: ['ого', '/', 'ому', 'ым'],
    explanation: '4格动物，阳性形容词词尾为-ого（同2格）。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 33,
    text: 'Мы уважаем умный преподавателя.',
    targetWord: 'умный',
    originalEnding: '',
    correctEnding: 'ого',
    possibleEndings: ['ого', '/', 'ому', 'ым'],
    explanation: '4格动物，阳性形容词词尾为-ого（同2格）。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 34,
    text: 'Я вижу красивый парня.',
    targetWord: 'красивый',
    originalEnding: '',
    correctEnding: 'ого',
    possibleEndings: ['ого', '/', 'ому', 'ым'],
    explanation: '4格动物，阳性形容词词尾为-ого（同2格）。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 35,
    text: 'Он гордится старый другом.',
    targetWord: 'старый',
    originalEnding: '',
    correctEnding: 'ым',
    possibleEndings: ['ым', 'ого', 'ому', '/'],
    explanation: '5格，阳性形容词词尾为-ым。',
    case: 5,
    gender: '阳性'
  },
  {
    id: 36,
    text: 'Он работает с хороший инженером.',
    targetWord: 'хороший',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'ого', 'ому', '/'],
    explanation: '5格，阳性形容词（ш后）词尾为-им。',
    case: 5,
    gender: '阳性'
  },
  {
    id: 37,
    text: 'Он был доволен новый результатом.',
    targetWord: 'новый',
    originalEnding: '',
    correctEnding: 'ым',
    possibleEndings: ['ым', 'ого', 'ому', '/'],
    explanation: '5格，阳性形容词词尾为-ым。',
    case: 5,
    gender: '阳性'
  },
  {
    id: 38,
    text: 'Он любуется красивый закатом.',
    targetWord: 'красивый',
    originalEnding: '',
    correctEnding: 'ым',
    possibleEndings: ['ым', 'ого', 'ому', '/'],
    explanation: '5格，阳性形容词词尾为-ым。',
    case: 5,
    gender: '阳性'
  },
  {
    id: 39,
    text: 'Он управляет большой судном.',
    targetWord: 'большой',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'ого', 'ому', '/'],
    explanation: '5格，中性形容词（ш后）词尾为-им。',
    case: 5,
    gender: '中性'
  },
  {
    id: 40,
    text: 'Он стал известный писателем.',
    targetWord: 'известный',
    originalEnding: '',
    correctEnding: 'ым',
    possibleEndings: ['ым', 'ого', 'ому', '/'],
    explanation: '5格，阳性形容词词尾为-ым。',
    case: 5,
    gender: '阳性'
  },
  {
    id: 41,
    text: 'Мы гордимся старый университетом.',
    targetWord: 'старый',
    originalEnding: '',
    correctEnding: 'ым',
    possibleEndings: ['ым', 'ого', 'ому', '/'],
    explanation: '5格，阳性形容词词尾为-ым。',
    case: 5,
    gender: '阳性'
  },
  {
    id: 42,
    text: 'Он занимается с трудный учеником.',
    targetWord: 'трудный',
    originalEnding: '',
    correctEnding: 'ым',
    possibleEndings: ['ым', 'ого', 'ому', '/'],
    explanation: '5格，阳性形容词词尾为-ым。',
    case: 5,
    gender: '阳性'
  },
  {
    id: 43,
    text: 'Мы говорили о интересный фильме.',
    targetWord: 'интересный',
    originalEnding: '',
    correctEnding: 'ом',
    possibleEndings: ['ом', 'ого', 'ому', '/'],
    explanation: '6格，阳性形容词词尾为-ом。',
    case: 6,
    gender: '阳性'
  },
  {
    id: 44,
    text: 'Мы думаем о будущий отпуске.',
    targetWord: 'будущий',
    originalEnding: '',
    correctEnding: 'ем',
    possibleEndings: ['ем', 'ого', 'ому', '/'],
    explanation: '6格，阳性形容词（щ后）词尾为-ем。',
    case: 6,
    gender: '阳性'
  },
  {
    id: 45,
    text: 'Я мечтаю о собственный доме.',
    targetWord: 'собственный',
    originalEnding: '',
    correctEnding: 'ом',
    possibleEndings: ['ом', 'ого', 'ому', '/'],
    explanation: '6格，阳性形容词词尾为-ом。',
    case: 6,
    gender: '阳性'
  },
  {
    id: 46,
    text: 'Они говорят о важный вопросе.',
    targetWord: 'важный',
    originalEnding: '',
    correctEnding: 'ом',
    possibleEndings: ['ом', 'ого', 'ому', '/'],
    explanation: '6格，阳性形容词词尾为-ом。',
    case: 6,
    gender: '阳性'
  },
  {
    id: 47,
    text: 'Мы думаем о предстоящий экзамене.',
    targetWord: 'предстоящий',
    originalEnding: '',
    correctEnding: 'ем',
    possibleEndings: ['ем', 'ого', 'ому', '/'],
    explanation: '6格，阳性形容词（щ后）词尾为-ем。',
    case: 6,
    gender: '阳性'
  },
  {
    id: 48,
    text: 'Расскажи о интересный путешествии.',
    targetWord: 'интересный',
    originalEnding: '',
    correctEnding: 'ом',
    possibleEndings: ['ом', 'ого', 'ому', '/'],
    explanation: '6格，中性形容词词尾为-ом。',
    case: 6,
    gender: '中性'
  },
  {
    id: 49,
    text: 'Я думаю о письменный столе.',
    targetWord: 'письменный',
    originalEnding: '',
    correctEnding: 'ом',
    possibleEndings: ['ом', 'ого', 'ому', '/'],
    explanation: '6格，阳性形容词词尾为-ом。',
    case: 6,
    gender: '阳性'
  },
  {
    id: 50,
    text: 'Мы говорили о летний отдыхе.',
    targetWord: 'летний',
    originalEnding: '',
    correctEnding: 'ем',
    possibleEndings: ['ем', 'ого', 'ому', '/'],
    explanation: '6格，阳性形容词（н后软）词尾为-ем。',
    case: 6,
    gender: '阳性'
  },
  // 阴性训练题目
  {
    id: 51,
    text: 'Это новая книга.',
    targetWord: 'новая',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ой', 'ую', 'ей'],
    explanation: '1格，阴性形容词不变。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 52,
    text: 'Наступила тёплая весна.',
    targetWord: 'тёплая',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ой', 'ую', 'ей'],
    explanation: '1格，阴性形容词不变。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 53,
    text: 'Моя любимая сестра приехала.',
    targetWord: 'любимая',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ой', 'ую', 'ей'],
    explanation: '1格，阴性形容词不变。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 54,
    text: 'Здесь вкусная пицца.',
    targetWord: 'вкусная',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ой', 'ую', 'ей'],
    explanation: '1格，阴性形容词不变。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 55,
    text: 'Какая красивая девушка!',
    targetWord: 'красивая',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ой', 'ую', 'ей'],
    explanation: '1格，阴性形容词不变。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 56,
    text: 'Это высокая гора.',
    targetWord: 'высокая',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ой', 'ую', 'ей'],
    explanation: '1格，阴性形容词不变。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 57,
    text: 'Чистая вода в стакане.',
    targetWord: 'Чистая',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ой', 'ую', 'ей'],
    explanation: '1格，阴性形容词不变。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 58,
    text: 'Интересная история началась.',
    targetWord: 'Интересная',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ой', 'ую', 'ей'],
    explanation: '1格，阴性形容词不变。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 59,
    text: 'У меня нет новая книги.',
    targetWord: 'новая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '2格，阴性形容词词尾为-ой。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 60,
    text: 'Цена этой красивая машины высока.',
    targetWord: 'красивая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '2格，阴性形容词词尾为-ой。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 61,
    text: 'Он ждёт ответа от важная персоны.',
    targetWord: 'важная',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '2格，阴性形容词词尾为-ой。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 62,
    text: 'Мы остановились у широкая реки.',
    targetWord: 'широкая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '2格，阴性形容词词尾为-ой。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 64,
    text: 'Цвет красная розы яркий.',
    targetWord: 'красная',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '2格，阴性形容词词尾为-ой。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 65,
    text: 'Дверь новая квартиры открыта.',
    targetWord: 'новая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '2格，阴性形容词词尾为-ой。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 66,
    text: 'Вкус холодная воды приятен.',
    targetWord: 'холодная',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '2格，阴性形容词词尾为-ой。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 67,
    text: 'Я иду к красивая площади.',
    targetWord: 'красивая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '3格，阴性形容词词尾为-ой。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 68,
    text: 'По широкая улице ходят люди.',
    targetWord: 'широкая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '3格，阴性形容词词尾为-ой。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 69,
    text: 'Мы рады тёплая погоде.',
    targetWord: 'тёплая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '3格，阴性形容词词尾为-ой。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 70,
    text: 'Помоги старая бабушке.',
    targetWord: 'старая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '3格，阴性形容词词尾为-ой。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 71,
    text: 'Он готовится к трудная контрольной.',
    targetWord: 'трудная',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '3格，阴性形容词词尾为-ой。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 72,
    text: 'По мокрая траве приятно ходить.',
    targetWord: 'мокрая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '3格，阴性形容词词尾为-ой。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 73,
    text: 'К высокая горе ведёт тропа.',
    targetWord: 'высокая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '3格，阴性形容词词尾为-ой。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 74,
    text: 'Она обрадовалась новая сумке.',
    targetWord: 'новая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '3格，阴性形容词词尾为-ой。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 75,
    text: 'Я вижу новая машину.',
    targetWord: 'новая',
    originalEnding: '',
    correctEnding: 'ую',
    possibleEndings: ['ую', '/', 'ой', 'ей'],
    explanation: '4格，阴性形容词词尾为-ую。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 76,
    text: 'Он купил красивая рубашку.',
    targetWord: 'красивая',
    originalEnding: '',
    correctEnding: 'ую',
    possibleEndings: ['ую', '/', 'ой', 'ей'],
    explanation: '4格，阴性形容词词尾为-ую。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 77,
    text: 'Мы любим русская литературу.',
    targetWord: 'русская',
    originalEnding: '',
    correctEnding: 'ую',
    possibleEndings: ['ую', '/', 'ой', 'ей'],
    explanation: '4格，阴性形容词词尾为-ую。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 78,
    text: 'Я жду старая подругу.',
    targetWord: 'старая',
    originalEnding: '',
    correctEnding: 'ую',
    possibleEndings: ['ую', '/', 'ой', 'ей'],
    explanation: '4格，阴性形容词词尾为-ую。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 79,
    text: 'Он потерял интересная книгу.',
    targetWord: 'интересная',
    originalEnding: '',
    correctEnding: 'ую',
    possibleEndings: ['ую', '/', 'ой', 'ей'],
    explanation: '4格，阴性形容词词尾为-ую。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 80,
    text: 'Мы слушаем громкая музыку.',
    targetWord: 'громкая',
    originalEnding: '',
    correctEnding: 'ую',
    possibleEndings: ['ую', '/', 'ой', 'ей'],
    explanation: '4格，阴性形容词词尾为-ую。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 81,
    text: 'Она пьёт горячая воду.',
    targetWord: 'горячая',
    originalEnding: '',
    correctEnding: 'ую',
    possibleEndings: ['ую', '/', 'ой', 'ей'],
    explanation: '4格，阴性形容词词尾为-ую。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 82,
    text: 'Я встретил умная девушку.',
    targetWord: 'умная',
    originalEnding: '',
    correctEnding: 'ую',
    possibleEndings: ['ую', '/', 'ой', 'ей'],
    explanation: '4格，阴性形容词词尾为-ую。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 83,
    text: 'Он читает свежая газету.',
    targetWord: 'свежая',
    originalEnding: '',
    correctEnding: 'ую',
    possibleEndings: ['ую', '/', 'ой', 'ей'],
    explanation: '4格，阴性形容词词尾为-ую。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 84,
    text: 'Я горжусь новая работой.',
    targetWord: 'новая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '5格，阴性形容词词尾为-ой。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 85,
    text: 'Он интересуется русская историей.',
    targetWord: 'русская',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '5格，阴性形容词词尾为-ой。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 86,
    text: 'Мы любуемся красивая природой.',
    targetWord: 'красивая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '5格，阴性形容词词尾为-ой。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 87,
    text: 'Она стала известная актрисой.',
    targetWord: 'известная',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '5格，阴性形容词词尾为-ой。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 88,
    text: 'Я доволен хорошая оценкой.',
    targetWord: 'хорошая',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ой', '/', 'ую'],
    explanation: '5格，阴性形容词词尾为-ей。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 89,
    text: 'Он занимается с трудная ученицей.',
    targetWord: 'трудная',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '5格，阴性形容词词尾为-ой。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 90,
    text: 'Мы поехали на такси с весёлая компанией.',
    targetWord: 'весёлая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '5格，阴性形容词词尾为-ой。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 91,
    text: 'Она работает над важная проблемой.',
    targetWord: 'важная',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '5格，阴性形容词词尾为-ой。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 92,
    text: 'Мы говорили о новая работе.',
    targetWord: 'новая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '6格，阴性形容词词尾为-ой。',
    case: 6,
    gender: '阴性'
  },
  {
    id: 93,
    text: 'Он мечтает о красивая девушке.',
    targetWord: 'красивая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '6格，阴性形容词词尾为-ой。',
    case: 6,
    gender: '阴性'
  },
  {
    id: 94,
    text: 'В старая книге много стихов.',
    targetWord: 'старая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '6格，阴性形容词词尾为-ой。',
    case: 6,
    gender: '阴性'
  },
  {
    id: 95,
    text: 'При встрече с подругой она вспоминала о летняя поездке.',
    targetWord: 'летняя',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ой', '/', 'ую'],
    explanation: '6格，阴性形容词词尾为-ей。',
    case: 6,
    gender: '阴性'
  },
  {
    id: 96,
    text: 'Я думаю о любимая маме.',
    targetWord: 'любимая',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '6格，阴性形容词词尾为-ой。',
    case: 6,
    gender: '阴性'
  },
  {
    id: 97,
    text: 'В соседняя комнате кто-то есть.',
    targetWord: 'соседняя',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ой', '/', 'ую'],
    explanation: '6格，阴性形容词词尾为-ей。',
    case: 6,
    gender: '阴性'
  },
  {
    id: 98,
    text: 'В холодная воде купаться нельзя.',
    targetWord: 'холодная',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '6格，阴性形容词词尾为-ой。',
    case: 6,
    gender: '阴性'
  },
  {
    id: 99,
    text: 'Он рассказывал о интересная встрече.',
    targetWord: 'интересная',
    originalEnding: '',
    correctEnding: 'ой',
    possibleEndings: ['ой', '/', 'ую', 'ей'],
    explanation: '6格，阴性形容词词尾为-ой。',
    case: 6,
    gender: '阴性'
  },
  {
    id: 100,
    text: 'О будущая профессии нужно думать.',
    targetWord: 'будущая',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ой', '/', 'ую'],
    explanation: '6格，阴性形容词词尾为-ей。',
    case: 6,
    gender: '阴性'
  },
  // 复数训练题目
  {
    id: 101,
    text: 'Это новые книги.',
    targetWord: 'новые',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ых', 'ым', 'ыми'],
    explanation: '1格，复数形容词不变。',
    case: 1,
    gender: '复数'
  },
  {
    id: 102,
    text: 'Наступили холодные дни.',
    targetWord: 'холодные',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ых', 'ым', 'ыми'],
    explanation: '1格，复数形容词不变。',
    case: 1,
    gender: '复数'
  },
  {
    id: 103,
    text: 'Мои любимые родители приехали.',
    targetWord: 'любимые',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ых', 'ым', 'ыми'],
    explanation: '1格，复数形容词不变。',
    case: 1,
    gender: '复数'
  },
  {
    id: 104,
    text: 'Здесь работают опытные врачи.',
    targetWord: 'опытные',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ых', 'ым', 'ыми'],
    explanation: '1格，复数形容词不变。',
    case: 1,
    gender: '复数'
  },
  {
    id: 105,
    text: 'Какие красивые цветы!',
    targetWord: 'красивые',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ых', 'ым', 'ыми'],
    explanation: '1格，复数形容词不变。',
    case: 1,
    gender: '复数'
  },
  {
    id: 106,
    text: 'Это высокие здания.',
    targetWord: 'высокие',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'их', 'им', 'ими'],
    explanation: '1格，复数形容词不变。',
    case: 1,
    gender: '复数'
  },
  {
    id: 107,
    text: 'Чистые окна блестят.',
    targetWord: 'Чистые',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ых', 'ым', 'ыми'],
    explanation: '1格，复数形容词不变。',
    case: 1,
    gender: '复数'
  },
  {
    id: 108,
    text: 'Интересные фильмы идут в кино.',
    targetWord: 'Интересные',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ых', 'ым', 'ыми'],
    explanation: '1格，复数形容词不变。',
    case: 1,
    gender: '复数'
  },
  {
    id: 109,
    text: 'У меня нет новые книг.',
    targetWord: 'новые',
    originalEnding: '',
    correctEnding: 'ых',
    possibleEndings: ['ых', '/', 'ым', 'ыми'],
    explanation: '2格，复数形容词词尾为-ых。',
    case: 2,
    gender: '复数'
  },
  {
    id: 110,
    text: 'Цена этих красивые машин слишком высока.',
    targetWord: 'красивые',
    originalEnding: '',
    correctEnding: 'ых',
    possibleEndings: ['ых', '/', 'ым', 'ыми'],
    explanation: '2格，复数形容词词尾为-ых。',
    case: 2,
    gender: '复数'
  },
  {
    id: 111,
    text: 'Он ждёт ответов от важные персон.',
    targetWord: 'важные',
    originalEnding: '',
    correctEnding: 'ых',
    possibleEndings: ['ых', '/', 'ым', 'ыми'],
    explanation: '2格，复数形容词词尾为-ых。',
    case: 2,
    gender: '复数'
  },
  {
    id: 112,
    text: 'Мы остановились у широкие рек.',
    targetWord: 'широкие',
    originalEnding: '',
    correctEnding: 'ых',
    possibleEndings: ['ых', '/', 'ым', 'ыми'],
    explanation: '2格，复数形容词词尾为-ых。',
    case: 2,
    gender: '复数'
  },

  {
    id: 114,
    text: 'Лепестки красные роз опали.',
    targetWord: 'красные',
    originalEnding: '',
    correctEnding: 'ых',
    possibleEndings: ['ых', '/', 'ым', 'ыми'],
    explanation: '2格，复数形容词词尾为-ых。',
    case: 2,
    gender: '复数'
  },
  {
    id: 115,
    text: 'Двери новые квартир открыты.',
    targetWord: 'новые',
    originalEnding: '',
    correctEnding: 'ых',
    possibleEndings: ['ых', '/', 'ым', 'ыми'],
    explanation: '2格，复数形容词词尾为-ых。',
    case: 2,
    gender: '复数'
  },
  {
    id: 116,
    text: 'Вкус холодные напитков приятен.',
    targetWord: 'холодные',
    originalEnding: '',
    correctEnding: 'ых',
    possibleEndings: ['ых', '/', 'ым', 'ыми'],
    explanation: '2格，复数形容词词尾为-ых。',
    case: 2,
    gender: '复数'
  },
  {
    id: 117,
    text: 'Я иду к красивые площадям.',
    targetWord: 'красивые',
    originalEnding: '',
    correctEnding: 'ым',
    possibleEndings: ['ым', '/', 'ых', 'ыми'],
    explanation: '3格，复数形容词词尾为-ым。',
    case: 3,
    gender: '复数'
  },
  {
    id: 118,
    text: 'По широкие улицам ходят люди.',
    targetWord: 'широкие',
    originalEnding: '',
    correctEnding: 'ым',
    possibleEndings: ['ым', '/', 'ых', 'ыми'],
    explanation: '3格，复数形容词词尾为-ым。',
    case: 3,
    gender: '复数'
  },
  {
    id: 119,
    text: 'Дети рады новогодние подаркам.',
    targetWord: 'новогодние',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', '/', 'ых', 'ыми'],
    explanation: '3格，复数形容词词尾为-им。',
    case: 3,
    gender: '复数'
  },
  {
    id: 120,
    text: 'Помоги старые людям.',
    targetWord: 'старые',
    originalEnding: '',
    correctEnding: 'ым',
    possibleEndings: ['ым', '/', 'ых', 'ыми'],
    explanation: '3格，复数形容词词尾为-ым。',
    case: 3,
    gender: '复数'
  },
  {
    id: 121,
    text: 'Он готовится к трудные экзаменам.',
    targetWord: 'трудные',
    originalEnding: '',
    correctEnding: 'ым',
    possibleEndings: ['ым', '/', 'ых', 'ыми'],
    explanation: '3格，复数形容词词尾为-ым。',
    case: 3,
    gender: '复数'
  },
  {
    id: 122,
    text: 'По мокрые тропам трудно идти.',
    targetWord: 'мокрые',
    originalEnding: '',
    correctEnding: 'ым',
    possibleEndings: ['ым', '/', 'ых', 'ыми'],
    explanation: '3格，复数形容词词尾为-ым。',
    case: 3,
    gender: '复数'
  },
  {
    id: 123,
    text: 'К высокие горам ведут тропы.',
    targetWord: 'высокие',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', '/', 'их', 'ими'],
    explanation: '3格，复数形容词词尾为-им。',
    case: 3,
    gender: '复数'
  },
  {
    id: 124,
    text: 'Она обрадовалась новые сумкам.',
    targetWord: 'новые',
    originalEnding: '',
    correctEnding: 'ым',
    possibleEndings: ['ым', '/', 'ых', 'ыми'],
    explanation: '3格，复数形容词词尾为-ым。',
    case: 3,
    gender: '复数'
  },
  {
    id: 125,
    text: 'Я вижу новые машины.',
    targetWord: 'новые',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ых', 'ым', 'ыми'],
    explanation: '4格非动物，复数形容词不变。',
    case: 4,
    gender: '复数'
  },
  {
    id: 126,
    text: 'Он купил красивые рубашки.',
    targetWord: 'красивые',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ых', 'ым', 'ыми'],
    explanation: '4格非动物，复数形容词不变。',
    case: 4,
    gender: '复数'
  },
  {
    id: 127,
    text: 'Мы любим русские песни.',
    targetWord: 'русские',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'их', 'им', 'ими'],
    explanation: '4格非动物，复数形容词不变。',
    case: 4,
    gender: '复数'
  },
  {
    id: 128,
    text: 'Я жду свои старые друзей.',
    targetWord: 'старые',
    originalEnding: '',
    correctEnding: 'ых',
    possibleEndings: ['ых', '/', 'ым', 'ыми'],
    explanation: '4格动物，复数形容词词尾为-ых。',
    case: 4,
    gender: '复数'
  },
  {
    id: 129,
    text: 'Он потерял интересные книги.',
    targetWord: 'интересные',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'ых', 'ым', 'ыми'],
    explanation: '4格非动物，复数形容词不变。',
    case: 4,
    gender: '复数'
  },
  {
    id: 130,
    text: 'Мы слушаем громкие песни.',
    targetWord: 'громкие',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'их', 'им', 'ими'],
    explanation: '4格非动物，复数形容词不变。',
    case: 4,
    gender: '复数'
  },
  {
    id: 131,
    text: 'Она пьёт горячие напитки.',
    targetWord: 'горячие',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'их', 'им', 'ими'],
    explanation: '4格非动物，复数形容词不变。',
    case: 4,
    gender: '复数'
  },
  {
    id: 132,
    text: 'Я встретил умные студенток.',
    targetWord: 'умные',
    originalEnding: '',
    correctEnding: 'ых',
    possibleEndings: ['ых', '/', 'ым', 'ыми'],
    explanation: '4格动物，复数形容词词尾为-ых。',
    case: 4,
    gender: '复数'
  },
  {
    id: 133,
    text: 'Он читает свежие газеты.',
    targetWord: 'свежие',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'их', 'им', 'ими'],
    explanation: '4格非动物，复数形容词不变。',
    case: 4,
    gender: '复数'
  },
  {
    id: 134,
    text: 'Я горжусь своими новые работами.',
    targetWord: 'новые',
    originalEnding: '',
    correctEnding: 'ыми',
    possibleEndings: ['ыми', '/', 'ых', 'ым'],
    explanation: '5格，复数形容词词尾为-ыми。',
    case: 5,
    gender: '复数'
  },
  {
    id: 135,
    text: 'Он интересуется русские традициями.',
    targetWord: 'русские',
    originalEnding: '',
    correctEnding: 'ими',
    possibleEndings: ['ими', '/', 'их', 'ым'],
    explanation: '5格，复数形容词词尾为-ими。',
    case: 5,
    gender: '复数'
  },
  {
    id: 136,
    text: 'Мы любуемся красивые пейзажами.',
    targetWord: 'красивые',
    originalEnding: '',
    correctEnding: 'ыми',
    possibleEndings: ['ыми', '/', 'ых', 'ым'],
    explanation: '5格，复数形容词词尾为-ыми。',
    case: 5,
    gender: '复数'
  },
  {
    id: 137,
    text: 'Они стали известные актёрами.',
    targetWord: 'известные',
    originalEnding: '',
    correctEnding: 'ыми',
    possibleEndings: ['ыми', '/', 'ых', 'ым'],
    explanation: '5格，复数形容词词尾为-ыми。',
    case: 5,
    gender: '复数'
  },
  {
    id: 138,
    text: 'Я доволен своими хорошие оценками.',
    targetWord: 'хорошие',
    originalEnding: '',
    correctEnding: 'ими',
    possibleEndings: ['ими', '/', 'ых', 'ым'],
    explanation: '5格，复数形容词词尾为-ими。',
    case: 5,
    gender: '复数'
  },
  {
    id: 139,
    text: 'Он занимается с трудные учениками.',
    targetWord: 'трудные',
    originalEnding: '',
    correctEnding: 'ыми',
    possibleEndings: ['ыми', '/', 'ых', 'ым'],
    explanation: '5格，复数形容词词尾为-ыми。',
    case: 5,
    gender: '复数'
  },
  {
    id: 140,
    text: 'Мы поехали на экскурсию с весёлые компаниями.',
    targetWord: 'весёлые',
    originalEnding: '',
    correctEnding: 'ыми',
    possibleEndings: ['ыми', '/', 'ых', 'ым'],
    explanation: '5格，复数形容词词尾为-ыми。',
    case: 5,
    gender: '复数'
  },
  {
    id: 141,
    text: 'Она работает над важные проблемами.',
    targetWord: 'важные',
    originalEnding: '',
    correctEnding: 'ыми',
    possibleEndings: ['ыми', '/', 'ых', 'ым'],
    explanation: '5格，复数形容词词尾为-ыми。',
    case: 5,
    gender: '复数'
  },
  {
    id: 142,
    text: 'Мы говорили о новые фильмах.',
    targetWord: 'новые',
    originalEnding: '',
    correctEnding: 'ых',
    possibleEndings: ['ых', '/', 'ым', 'ыми'],
    explanation: '6格，复数形容词词尾为-ых。',
    case: 6,
    gender: '复数'
  },
  {
    id: 143,
    text: 'Он мечтает о красивые девушках.',
    targetWord: 'красивые',
    originalEnding: '',
    correctEnding: 'ых',
    possibleEndings: ['ых', '/', 'ым', 'ыми'],
    explanation: '6格，复数形容词词尾为-ых。',
    case: 6,
    gender: '复数'
  },
  {
    id: 144,
    text: 'В эти старые книгах много стихов.',
    targetWord: 'старые',
    originalEnding: '',
    correctEnding: 'ых',
    possibleEndings: ['ых', '/', 'ым', 'ыми'],
    explanation: '6格，复数形容词词尾为-ых。',
    case: 6,
    gender: '复数'
  },
  {
    id: 145,
    text: 'При встрече с друзьями она вспоминала о летние поездках.',
    targetWord: 'летние',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', '/', 'ым', 'ыми'],
    explanation: '6格，复数形容词词尾为-их。',
    case: 6,
    gender: '复数'
  },
  {
    id: 146,
    text: 'Я думаю о свои любимые родителях.',
    targetWord: 'любимые',
    originalEnding: '',
    correctEnding: 'ых',
    possibleEndings: ['ых', '/', 'ым', 'ыми'],
    explanation: '6格，复数形容词词尾为-ых。',
    case: 6,
    gender: '复数'
  },
  {
    id: 147,
    text: 'В соседние комнатах кто-то есть.',
    targetWord: 'соседние',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', '/', 'ым', 'ыми'],
    explanation: '6格，复数形容词词尾为-их。',
    case: 6,
    gender: '复数'
  },
  {
    id: 148,
    text: 'В холодные водах купаться нельзя.',
    targetWord: 'холодные',
    originalEnding: '',
    correctEnding: 'ых',
    possibleEndings: ['ых', '/', 'ым', 'ыми'],
    explanation: '6格，复数形容词词尾为-ых。',
    case: 6,
    gender: '复数'
  },
  {
    id: 149,
    text: 'Он рассказывал о интересные встречах.',
    targetWord: 'интересные',
    originalEnding: '',
    correctEnding: 'ых',
    possibleEndings: ['ых', '/', 'ым', 'ыми'],
    explanation: '6格，复数形容词词尾为-ых。',
    case: 6,
    gender: '复数'
  },
  {
    id: 150,
    text: 'О будущие профессиях нужно думать.',
    targetWord: 'будущие',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', '/', 'ым', 'ыми'],
    explanation: '6格，复数形容词词尾为-их。',
    case: 6,
    gender: '复数'
  }
])

// 人称代词训练题目数据
const personalPronounTrainingSentences = ref<Array<{
  id: number
  text: string
  targetWord: string
  originalEnding: string
  correctEnding: string
  possibleEndings: string[]
  explanation: string
  case: number
  gender: string
}>>([
  // 单数人称训练题目
  {
    id: 1,
    text: 'Дай я книгу.',
    targetWord: 'я',
    originalEnding: '',
    correctEnding: 'мне',
    possibleEndings: ['мне', 'меня', 'мной', 'мною'],
    explanation: '3格，动词 дать 要求与格',
    case: 3,
    gender: '单数'
  },
  {
    id: 2,
    text: 'Я иду к ты в гости.',
    targetWord: 'ты',
    originalEnding: '',
    correctEnding: 'тебе',
    possibleEndings: ['тебе', 'тебя', 'тобой', 'тобою'],
    explanation: '3格，介词 к 要求与格',
    case: 3,
    gender: '单数'
  },
  {
    id: 3,
    text: 'Ты видел он вчера?',
    targetWord: 'он',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', 'него', 'ним', 'нём'],
    explanation: '4格，动词 видеть 要求宾格',
    case: 4,
    gender: '单数'
  },
  {
    id: 4,
    text: 'Мы гордимся она.',
    targetWord: 'она',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'неё', 'ней', 'нею'],
    explanation: '5格，动词 гордиться 要求工具格',
    case: 5,
    gender: '单数'
  },
  {
    id: 5,
    text: 'Расскажи мне о оно.',
    targetWord: 'оно',
    originalEnding: '',
    correctEnding: 'нём',
    possibleEndings: ['нём', 'него', 'ним', 'нём'],
    explanation: '6格，介词 о 要求前置格，第三人称代词后加 н-',
    case: 6,
    gender: '单数'
  },
  {
    id: 6,
    text: 'У ты нет времени?',
    targetWord: 'ты',
    originalEnding: '',
    correctEnding: 'тебя',
    possibleEndings: ['тебя', 'тебе', 'тобой', 'тобою'],
    explanation: '2格，介词 у 要求属格',
    case: 2,
    gender: '单数'
  },
  {
    id: 7,
    text: 'Я дал она книгу.',
    targetWord: 'она',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'неё', 'ней', 'нею'],
    explanation: '3格，动词 дать 要求与格',
    case: 3,
    gender: '单数'
  },
  {
    id: 8,
    text: 'Она пригласила я на день рождения.',
    targetWord: 'я',
    originalEnding: '',
    correctEnding: 'меня',
    possibleEndings: ['меня', 'мне', 'мной', 'мною'],
    explanation: '4格，动词 пригласить 要求宾格',
    case: 4,
    gender: '单数'
  },
  {
    id: 9,
    text: 'Он интересуется ты.',
    targetWord: 'ты',
    originalEnding: '',
    correctEnding: 'тобой',
    possibleEndings: ['тобой', 'тебя', 'тебе', 'тобою'],
    explanation: '5格，动词 интересоваться 要求工具格',
    case: 5,
    gender: '单数'
  },
  {
    id: 10,
    text: 'Я думаю о он часто.',
    targetWord: 'он',
    originalEnding: '',
    correctEnding: 'нём',
    possibleEndings: ['нём', 'него', 'ним', 'нём'],
    explanation: '6格，介词 о 要求前置格，第三人称代词后加 н-',
    case: 6,
    gender: '单数'
  },
  {
    id: 11,
    text: 'Без я они не справятся.',
    targetWord: 'я',
    originalEnding: '',
    correctEnding: 'меня',
    possibleEndings: ['меня', 'мне', 'мной', 'мною'],
    explanation: '2格，介词 без 要求属格',
    case: 2,
    gender: '单数'
  },
  {
    id: 12,
    text: 'Напиши ты письмо.',
    targetWord: 'ты',
    originalEnding: '',
    correctEnding: 'тебе',
    possibleEndings: ['тебе', 'тебя', 'тобой', 'тобою'],
    explanation: '3格，动词 написать 要求与格',
    case: 3,
    gender: '单数'
  },
  {
    id: 13,
    text: 'Я люблю она.',
    targetWord: 'она',
    originalEnding: '',
    correctEnding: 'её',
    possibleEndings: ['её', 'неё', 'ей', 'ней'],
    explanation: '4格，动词 любить 要求宾格',
    case: 4,
    gender: '单数'
  },
  {
    id: 14,
    text: 'Мы встретились с он в парке.',
    targetWord: 'он',
    originalEnding: '',
    correctEnding: 'ним',
    possibleEndings: ['ним', 'него', 'его', 'нём'],
    explanation: '5格，介词 с 要求工具格，第三人称代词后加 н-',
    case: 5,
    gender: '单数'
  },

  {
    id: 16,
    text: 'У она красивые глаза.',
    targetWord: 'она',
    originalEnding: '',
    correctEnding: 'неё',
    possibleEndings: ['неё', 'ей', 'её', 'ней'],
    explanation: '2格，介词 у 要求属格，第三人称代词后加 н-',
    case: 2,
    gender: '单数'
  },
  {
    id: 17,
    text: 'Подойди к он и поздоровайся.',
    targetWord: 'он',
    originalEnding: '',
    correctEnding: 'нему',
    possibleEndings: ['нему', 'него', 'его', 'ним'],
    explanation: '3格，介词 к 要求与格，第三人称代词后加 н-',
    case: 3,
    gender: '单数'
  },
  {
    id: 18,
    text: 'Я не понимаю ты.',
    targetWord: 'ты',
    originalEnding: '',
    correctEnding: 'тебя',
    possibleEndings: ['тебя', 'тебе', 'тобой', 'тобою'],
    explanation: '4格，动词 понимать 要求宾格',
    case: 4,
    gender: '单数'
  },
  {
    id: 19,
    text: 'Он работает вместе со я.',
    targetWord: 'я',
    originalEnding: '',
    correctEnding: 'мной',
    possibleEndings: ['мной', 'меня', 'мне', 'мною'],
    explanation: '5格，介词 с 要求工具格（实际连用时常为 со мной）',
    case: 5,
    gender: '单数'
  },
  {
    id: 20,
    text: 'Что ты думаешь обо я?',
    targetWord: 'я',
    originalEnding: '',
    correctEnding: 'мне',
    possibleEndings: ['мне', 'меня', 'мной', 'мною'],
    explanation: '6格，介词 о 要求前置格（实际连用时常为 обо мне）',
    case: 6,
    gender: '单数'
  },
  {
    id: 21,
    text: 'У он нет ключей.',
    targetWord: 'он',
    originalEnding: '',
    correctEnding: 'него',
    possibleEndings: ['него', 'нему', 'его', 'ним'],
    explanation: '2格，介词 у 要求属格，第三人称代词后加 н-',
    case: 2,
    gender: '单数'
  },
  {
    id: 22,
    text: 'Помоги она с переводом.',
    targetWord: 'она',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'неё', 'её', 'ней'],
    explanation: '3格，动词 помочь 要求与格',
    case: 3,
    gender: '单数'
  },
  {
    id: 23,
    text: 'Я встретил ты на улице.',
    targetWord: 'ты',
    originalEnding: '',
    correctEnding: 'тебя',
    possibleEndings: ['тебя', 'тебе', 'тобой', 'тобою'],
    explanation: '4格，动词 встретить 要求宾格',
    case: 4,
    gender: '单数'
  },
  {
    id: 24,
    text: 'Я подошёл к оно.',
    targetWord: 'оно',
    originalEnding: '',
    correctEnding: 'нему',
    possibleEndings: ['нему', 'него', 'его', 'ним'],
    explanation: '3格，介词 к 要求与格，第三人称代词后加 н-',
    case: 3,
    gender: '单数'
  },
  {
    id: 25,
    text: 'В она есть что-то особенное.',
    targetWord: 'она',
    originalEnding: '',
    correctEnding: 'ней',
    possibleEndings: ['ней', 'неё', 'ей', 'её'],
    explanation: '6格，介词 в 要求前置格，第三人称代词后加 н-',
    case: 6,
    gender: '单数'
  },
  {
    id: 26,
    text: 'У ты хороший вкус.',
    targetWord: 'ты',
    originalEnding: '',
    correctEnding: 'тебя',
    possibleEndings: ['тебя', 'тебе', 'тобой', 'тобою'],
    explanation: '2格，介词 у 要求属格',
    case: 2,
    gender: '单数'
  },
  {
    id: 27,
    text: 'Он доволен оно.',
    targetWord: 'оно',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'него', 'нему', 'нём'],
    explanation: '5格，短尾形容词 доволен 要求工具格',
    case: 5,
    gender: '单数'
  },
  {
    id: 28,
    text: 'Мы ждём он уже полчаса.',
    targetWord: 'он',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', 'него', 'нему', 'ним'],
    explanation: '4格，动词 ждать 要求宾格',
    case: 4,
    gender: '单数'
  },
  {
    id: 29,
    text: 'У оно нет цвета.',
    targetWord: 'оно',
    originalEnding: '',
    correctEnding: 'него',
    possibleEndings: ['него', 'нему', 'его', 'ним'],
    explanation: '2格，介词 у 要求属格，第三人称代词后加 н-',
    case: 2,
    gender: '单数'
  },
  {
    id: 30,
    text: 'Мы вспоминали о он.',
    targetWord: 'он',
    originalEnding: '',
    correctEnding: 'нём',
    possibleEndings: ['нём', 'него', 'нему', 'ним'],
    explanation: '6格，介词 о 要求前置格，第三人称代词后加 н-',
    case: 6,
    gender: '单数'
  },
  {
    id: 31,
    text: 'У она нет брата?',
    targetWord: 'она',
    originalEnding: '',
    correctEnding: 'неё',
    possibleEndings: ['неё', 'ей', 'её', 'ней'],
    explanation: '2格，介词 у 要求属格，第三人称代词后加 н-',
    case: 2,
    gender: '单数'
  },
  {
    id: 32,
    text: 'Я иду к он завтра.',
    targetWord: 'он',
    originalEnding: '',
    correctEnding: 'нему',
    possibleEndings: ['нему', 'него', 'его', 'ним'],
    explanation: '3格，介词 к 要求与格，第三人称代词后加 н-',
    case: 3,
    gender: '单数'
  },
  {
    id: 33,
    text: 'Ты видишь я сейчас?',
    targetWord: 'я',
    originalEnding: '',
    correctEnding: 'меня',
    possibleEndings: ['меня', 'мне', 'мной', 'мною'],
    explanation: '4格，动词 видеть 要求宾格',
    case: 4,
    gender: '单数'
  },
  {
    id: 34,
    text: 'Она занимается с ты спортом.',
    targetWord: 'ты',
    originalEnding: '',
    correctEnding: 'тобой',
    possibleEndings: ['тобой', 'тебя', 'тебе', 'тобою'],
    explanation: '5格，介词 с 要求工具格',
    case: 5,
    gender: '单数'
  },
  {
    id: 35,
    text: 'В ты я уверен.',
    targetWord: 'ты',
    originalEnding: '',
    correctEnding: 'тебе',
    possibleEndings: ['тебе', 'тебя', 'тобой', 'тобою'],
    explanation: '6格，介词 в 要求前置格',
    case: 6,
    gender: '单数'
  },
  {
    id: 36,
    text: 'У он есть сестра.',
    targetWord: 'он',
    originalEnding: '',
    correctEnding: 'него',
    possibleEndings: ['него', 'нему', 'его', 'ним'],
    explanation: '2格，介词 у 要求属格，第三人称代词后加 н-',
    case: 2,
    gender: '单数'
  },
  {
    id: 37,
    text: 'Позвони она вечером.',
    targetWord: 'она',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'неё', 'её', 'ней'],
    explanation: '3格，动词 позвонить 要求与格',
    case: 3,
    gender: '单数'
  },
  {
    id: 38,
    text: 'Я не слышу ты.',
    targetWord: 'ты',
    originalEnding: '',
    correctEnding: 'тебя',
    possibleEndings: ['тебя', 'тебе', 'тобой', 'тобою'],
    explanation: '4格，动词 слышать 要求宾格',
    case: 4,
    gender: '单数'
  },
  {
    id: 39,
    text: 'Я вижу оно.',
    targetWord: 'оно',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', 'него', 'нему', 'ним'],
    explanation: '4格，动词 видеть 要求宾格（оно 的宾格同 он）',
    case: 4,
    gender: '单数'
  },
  {
    id: 40,
    text: 'О оно никто не знает.',
    targetWord: 'оно',
    originalEnding: '',
    correctEnding: 'нём',
    possibleEndings: ['нём', 'него', 'нему', 'ним'],
    explanation: '6格，介词 о 要求前置格，第三人称代词后加 н-',
    case: 6,
    gender: '单数'
  },
  // 复数人称训练题目
  {
    id: 41,
    text: 'У мы есть вопросы.',
    targetWord: 'мы',
    originalEnding: '',
    correctEnding: 'нас',
    possibleEndings: ['нас', 'нам', 'нами'],
    explanation: '2格，前置词у要求第二格，мы的第二格是нас。',
    case: 2,
    gender: '复数'
  },
  {
    id: 42,
    text: 'Он старше мы.',
    targetWord: 'мы',
    originalEnding: '',
    correctEnding: 'нас',
    possibleEndings: ['нас', 'нам', 'нами'],
    explanation: '2格，比较级后名词用第二格，мы的第二格是нас。',
    case: 2,
    gender: '复数'
  },
  {
    id: 43,
    text: 'У вы нет машины?',
    targetWord: 'вы',
    originalEnding: '',
    correctEnding: 'вас',
    possibleEndings: ['вас', 'вам', 'вами'],
    explanation: '2格，前置词у要求第二格，вы的第二格是вас。',
    case: 2,
    gender: '复数'
  },
  {
    id: 44,
    text: 'Для вы это задание слишком сложное.',
    targetWord: 'вы',
    originalEnding: '',
    correctEnding: 'вас',
    possibleEndings: ['вас', 'вам', 'вами'],
    explanation: '2格，前置词для要求第二格，вы的第二格是вас。',
    case: 2,
    gender: '复数'
  },
  {
    id: 45,
    text: 'У они сегодня экзамен.',
    targetWord: 'они',
    originalEnding: '',
    correctEnding: 'них',
    possibleEndings: ['них', 'ним', 'ими'],
    explanation: '2格，前置词у要求第二格，они的第二格是их，但у后需加н，故为них。',
    case: 2,
    gender: '复数'
  },
  {
    id: 46,
    text: 'Вместо они пришли другие люди.',
    targetWord: 'они',
    originalEnding: '',
    correctEnding: 'них',
    possibleEndings: ['них', 'ним', 'ими'],
    explanation: '2格，前置词вместо要求第二格，они的第二格是их，但вместo后需加н，故为них。',
    case: 2,
    gender: '复数'
  },
  {
    id: 47,
    text: 'Мы ждём ответа от они.',
    targetWord: 'они',
    originalEnding: '',
    correctEnding: 'них',
    possibleEndings: ['них', 'ним', 'ими'],
    explanation: '2格，前置词от要求第二格，они的第二格是их，但от后需加н，故为них。',
    case: 2,
    gender: '复数'
  },
  {
    id: 48,
    text: 'Позвоните мы вечером.',
    targetWord: 'мы',
    originalEnding: '',
    correctEnding: 'нам',
    possibleEndings: ['нам', 'нас', 'нами'],
    explanation: '3格，动词позвонить要求第三格，мы的第三格是нам。',
    case: 3,
    gender: '复数'
  },
  {
    id: 49,
    text: 'К мы пришли гости.',
    targetWord: 'мы',
    originalEnding: '',
    correctEnding: 'нам',
    possibleEndings: ['нам', 'нас', 'нами'],
    explanation: '3格，前置词к要求第三格，мы的第三格是нам。',
    case: 3,
    gender: '复数'
  },
  {
    id: 50,
    text: 'Я напишу вы письмо.',
    targetWord: 'вы',
    originalEnding: '',
    correctEnding: 'вам',
    possibleEndings: ['вам', 'вас', 'вами'],
    explanation: '3格，动词написать要求第三格，вы的第三格是вам。',
    case: 3,
    gender: '复数'
  },
  {
    id: 51,
    text: 'Благодаря вы мы справились.',
    targetWord: 'вы',
    originalEnding: '',
    correctEnding: 'вам',
    possibleEndings: ['вам', 'вас', 'вами'],
    explanation: '3格，前置词благодаря要求第三格，вы的第三格是вам。',
    case: 3,
    gender: '复数'
  },
  {
    id: 52,
    text: 'Расскажи они правду.',
    targetWord: 'они',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'них', 'ими'],
    explanation: '3格，动词рассказать要求第三格，они的第三格是им。',
    case: 3,
    gender: '复数'
  },
  {
    id: 53,
    text: 'Мы подошли к они.',
    targetWord: 'они',
    originalEnding: '',
    correctEnding: 'ним',
    possibleEndings: ['ним', 'них', 'ими'],
    explanation: '3格，前置词к要求第三格，они的第三格是им，但к后需加н，故为ним。',
    case: 3,
    gender: '复数'
  },
  {
    id: 54,
    text: 'Они пригласили мы на вечеринку.',
    targetWord: 'мы',
    originalEnding: '',
    correctEnding: 'нас',
    possibleEndings: ['нас', 'нам', 'нами'],
    explanation: '4格，动词пригласить要求第四格，мы的第四格是нас。',
    case: 4,
    gender: '复数'
  },
  {
    id: 55,
    text: 'Ты узнаёшь мы на фото?',
    targetWord: 'мы',
    originalEnding: '',
    correctEnding: 'нас',
    possibleEndings: ['нас', 'нам', 'нами'],
    explanation: '4格，动词узнавать要求第四格，мы的第四格是нас。',
    case: 4,
    gender: '复数'
  },
  {
    id: 56,
    text: 'Я люблю вы.',
    targetWord: 'вы',
    originalEnding: '',
    correctEnding: 'вас',
    possibleEndings: ['вас', 'вам', 'вами'],
    explanation: '4格，动词любить要求第四格，вы的第四格是вас。',
    case: 4,
    gender: '复数'
  },
  {
    id: 57,
    text: 'Директор вызвал вы в кабинет.',
    targetWord: 'вы',
    originalEnding: '',
    correctEnding: 'вас',
    possibleEndings: ['вас', 'вам', 'вами'],
    explanation: '4格，动词вызвать要求第四格，вы的第四格是вас。',
    case: 4,
    gender: '复数'
  },
  {
    id: 58,
    text: 'Мы встретили они в парке.',
    targetWord: 'они',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'них', 'ими'],
    explanation: '4格，动词встретить要求第四格，они的第四格是их。',
    case: 4,
    gender: '复数'
  },
  {
    id: 59,
    text: 'Мы рассчитываем на они.',
    targetWord: 'они',
    originalEnding: '',
    correctEnding: 'них',
    possibleEndings: ['них', 'ним', 'ими'],
    explanation: '4格，动词рассчитывать要求на+第四格，они的第四格是их，但на后需加н，故为них。',
    case: 4,
    gender: '复数'
  },
  {
    id: 60,
    text: 'Они довольны мы.',
    targetWord: 'мы',
    originalEnding: '',
    correctEnding: 'нами',
    possibleEndings: ['нами', 'нас', 'нам'],
    explanation: '5格，形容词довольны要求第五格，мы的第五格是нами。',
    case: 5,
    gender: '复数'
  },
  {
    id: 61,
    text: 'Пойдёшь с мы в кино?',
    targetWord: 'мы',
    originalEnding: '',
    correctEnding: 'нами',
    possibleEndings: ['нами', 'нас', 'нам'],
    explanation: '5格，前置词с要求第五格，мы的第五格是нами。',
    case: 5,
    gender: '复数'
  },
  {
    id: 62,
    text: 'Я восхищаюсь вы.',
    targetWord: 'вы',
    originalEnding: '',
    correctEnding: 'вами',
    possibleEndings: ['вами', 'вас', 'вам'],
    explanation: '5格，动词восхищаться要求第五格，вы的第五格是вами。',
    case: 5,
    gender: '复数'
  },
  {
    id: 63,
    text: 'Между вы и нами нет секретов.',
    targetWord: 'вы',
    originalEnding: '',
    correctEnding: 'вами',
    possibleEndings: ['вами', 'вас', 'вам'],
    explanation: '5格，前置词между要求第五格，вы的第五格是вами。',
    case: 5,
    gender: '复数'
  },
  {
    id: 64,
    text: 'Мы гордимся они.',
    targetWord: 'они',
    originalEnding: '',
    correctEnding: 'ими',
    possibleEndings: ['ими', 'них', 'ним'],
    explanation: '5格，动词гордиться要求第五格，они的第五格是ими。',
    case: 5,
    gender: '复数'
  },
  {
    id: 65,
    text: 'С они всегда весело.',
    targetWord: 'они',
    originalEnding: '',
    correctEnding: 'ними',
    possibleEndings: ['ними', 'них', 'ним'],
    explanation: '5格，前置词с要求第五格，они的第五格是ими，但с后需加н，故为ними。',
    case: 5,
    gender: '复数'
  },
  {
    id: 66,
    text: 'Они вспоминают о мы.',
    targetWord: 'мы',
    originalEnding: '',
    correctEnding: 'нас',
    possibleEndings: ['нас', 'нам', 'нами'],
    explanation: '6格，前置词о要求第六格，мы的第六格是нас。',
    case: 6,
    gender: '复数'
  },
  {
    id: 67,
    text: 'При мы всегда есть телефон.',
    targetWord: 'мы',
    originalEnding: '',
    correctEnding: 'нас',
    possibleEndings: ['нас', 'нам', 'нами'],
    explanation: '6格，前置词при要求第六格，мы的第六格是нас。',
    case: 6,
    gender: '复数'
  },
  {
    id: 68,
    text: 'Мы говорили о вы вчера.',
    targetWord: 'вы',
    originalEnding: '',
    correctEnding: 'вас',
    possibleEndings: ['вас', 'вам', 'вами'],
    explanation: '6格，前置词о要求第六格，вы的第六格是вас。',
    case: 6,
    gender: '复数'
  },
  {
    id: 69,
    text: 'Я часто думаю о они.',
    targetWord: 'они',
    originalEnding: '',
    correctEnding: 'них',
    possibleEndings: ['них', 'ним', 'ими'],
    explanation: '6格，前置词о要求第六格，они的第六格是них。',
    case: 6,
    gender: '复数'
  },
  {
    id: 70,
    text: 'На они была надета новая форма.',
    targetWord: 'они',
    originalEnding: '',
    correctEnding: 'них',
    possibleEndings: ['них', 'ним', 'ими'],
    explanation: '6格，前置词на要求第六格，они的第六格是них。',
    case: 6,
    gender: '复数'
  }
])

// 形容词+名词组合训练题目数据
const adjNounCombinedSentences = ref<Array<{
  id: number
  text: string
  targetWord: string
  correctAnswer: string
  explanation: string
  case: number
  number: string
}>>([
  {
    id: 1,
    text: 'Вчера я купил хорошая книга в подарок другу.',
    targetWord: 'хорошая книга',
    correctAnswer: 'хорошую книгу',
    explanation: '动词 купить 要求第四格。',
    case: 4,
    number: '单数'
  },
  {
    id: 2,
    text: 'Дети радуются белый снег зимой.',
    targetWord: 'белый снег',
    correctAnswer: 'белому снегу',
    explanation: '动词 радоваться 要求第三格。',
    case: 3,
    number: '单数'
  },
  {
    id: 3,
    text: 'Мы любовались красивый город вечером.',
    targetWord: 'красивый город',
    correctAnswer: 'красивым городом',
    explanation: '动词 любоваться 要求第五格。',
    case: 5,
    number: '单数'
  },
  {
    id: 4,
    text: 'На столе не было свежий хлеб.',
    targetWord: 'свежий хлеб',
    correctAnswer: 'свежего хлеба',
    explanation: '否定结构"не было"要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 5,
    text: 'Они встретились у старый парк.',
    targetWord: 'старый парк',
    correctAnswer: 'старого парка',
    explanation: '前置词 у 要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 6,
    text: 'Мама сварила компот из спелое яблоко.',
    targetWord: 'спелое яблоко',
    correctAnswer: 'спелого яблока',
    explanation: '前置词 из 要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 7,
    text: 'Студенты говорили о новый фильм.',
    targetWord: 'новый фильм',
    correctAnswer: 'новых фильмах',
    explanation: '前置词 о 要求第六格，复数。',
    case: 6,
    number: '复数'
  },
  {
    id: 8,
    text: 'В зоопарке дети видели интересное животное.',
    targetWord: 'интересное животное',
    correctAnswer: 'интересных животных',
    explanation: '动词 видели 要求第四格，动物名词复数第四格同第二格。',
    case: 4,
    number: '复数'
  },
  {
    id: 9,
    text: 'Для маленький ребенок эта игра не подходит.',
    targetWord: 'маленький ребенок',
    correctAnswer: 'маленьких детей',
    explanation: '前置词 для 要求第二格，复数。',
    case: 2,
    number: '复数'
  },
  {
    id: 10,
    text: 'Экскурсовод рассказывал о старинное здание.',
    targetWord: 'старинное здание',
    correctAnswer: 'старинных зданиях',
    explanation: '前置词 о 要求第六格，复数。',
    case: 6,
    number: '复数'
  },
  {
    id: 11,
    text: 'Я мечтаю о большая квартира в центре.',
    targetWord: 'большая квартира',
    correctAnswer: 'большой квартире',
    explanation: '动词 мечтать о 要求第六格。',
    case: 6,
    number: '单数'
  },
  {
    id: 12,
    text: 'Спортсмены гордились золотая медаль.',
    targetWord: 'золотая медаль',
    correctAnswer: 'золотыми медалями',
    explanation: '动词 гордились 要求第五格，复数。',
    case: 5,
    number: '复数'
  },
  {
    id: 13,
    text: 'В библиотеке нет учебника по русский язык.',
    targetWord: 'русский язык',
    correctAnswer: 'русскому языку',
    explanation: '前置词 по 表示学科时要求第三格。',
    case: 3,
    number: '单数'
  },
  {
    id: 14,
    text: 'Мы шли по широкая улица.',
    targetWord: 'широкая улица',
    correctAnswer: 'широкой улице',
    explanation: '前置词 по 表示"沿着"时要求第三格。',
    case: 3,
    number: '单数'
  },
  {
    id: 15,
    text: 'Художник рисовал портрет молодая женщина.',
    targetWord: 'молодая женщина',
    correctAnswer: 'молодой женщины',
    explanation: '名词 портрет 后接第二格表示对象。',
    case: 2,
    number: '单数'
  },
  {
    id: 16,
    text: 'Кошка играла с маленький мяч.',
    targetWord: 'маленький мяч',
    correctAnswer: 'маленьким мячом',
    explanation: '前置词 с 表示工具时要求第五格。',
    case: 5,
    number: '单数'
  },
  {
    id: 17,
    text: 'В тексте были ошибки в длинное предложение.',
    targetWord: 'длинное предложение',
    correctAnswer: 'длинных предложениях',
    explanation: '前置词 в 表示范围时要求第六格，复数。',
    case: 6,
    number: '复数'
  },
  {
    id: 18,
    text: 'Друзья купили билеты на интересный спектакль.',
    targetWord: 'интересный спектакль',
    correctAnswer: 'интересный спектакль',
    explanation: '前置词 на 表示方向时要求第四格。',
    case: 4,
    number: '单数'
  },
  {
    id: 19,
    text: 'На выставке показаны работы известный художник.',
    targetWord: 'известный художник',
    correctAnswer: 'известных художников',
    explanation: '名词 работы 后接第二格表示所属，复数。',
    case: 2,
    number: '复数'
  },
  {
    id: 20,
    text: 'Пассажиры ждали скорый поезд.',
    targetWord: 'скорый поезд',
    correctAnswer: 'скорого поезда',
    explanation: '动词 ждали 要求第二格（表示期望的事物）。',
    case: 2,
    number: '单数'
  },
  {
    id: 21,
    text: 'Мы говорили о летние каникулы.',
    targetWord: 'летние каникулы',
    correctAnswer: 'летних каникулах',
    explanation: '前置词 о 要求第六格，复数。',
    case: 6,
    number: '复数'
  },
  {
    id: 22,
    text: 'Врач выписал лекарство от сильный кашель.',
    targetWord: 'сильный кашель',
    correctAnswer: 'сильного кашля',
    explanation: '前置词 от 表示原因时要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 23,
    text: 'Девочка угостила подругу вкусная конфета.',
    targetWord: 'вкусная конфета',
    correctAnswer: 'вкусной конфетой',
    explanation: '动词 угостила 要求第五格。',
    case: 5,
    number: '单数'
  },
  {
    id: 24,
    text: 'В статье писали о важная проблема.',
    targetWord: 'важная проблема',
    correctAnswer: 'важных проблемах',
    explanation: '前置词 о 要求第六格，复数。',
    case: 6,
    number: '复数'
  },
  {
    id: 25,
    text: 'Студенты сдали экзамен по трудный предмет.',
    targetWord: 'трудный предмет',
    correctAnswer: 'трудному предмету',
    explanation: '前置词 по 表示学科时要求第三格。',
    case: 3,
    number: '单数'
  },
  {
    id: 26,
    text: 'Рыбаки вернулись с хороший улов.',
    targetWord: 'хороший улов',
    correctAnswer: 'хорошим уловом',
    explanation: '前置词 с 表示伴随时要求第五格。',
    case: 5,
    number: '单数'
  },
  {
    id: 27,
    text: 'Для горячий чай нужен сахар.',
    targetWord: 'горячий чай',
    correctAnswer: 'горячего чая',
    explanation: '前置词 для 表示用途时要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 28,
    text: 'Туристы смотрели на красивый закат.',
    targetWord: 'красивый закат',
    correctAnswer: 'красивый закат',
    explanation: '动词 смотрели на 要求第四格。',
    case: 4,
    number: '单数'
  },
  {
    id: 29,
    text: 'В музее есть картины великий художник.',
    targetWord: 'великий художник',
    correctAnswer: 'великих художников',
    explanation: '名词 картины 后接第二格表示作者，复数。',
    case: 2,
    number: '复数'
  },
  {
    id: 30,
    text: 'Ребёнок боится громкий звук.',
    targetWord: 'громкий звук',
    correctAnswer: 'громких звуков',
    explanation: '动词 боится 要求第二格，复数。',
    case: 2,
    number: '复数'
  },
  {
    id: 31,
    text: 'Комнату украсили воздушный шар.',
    targetWord: 'воздушный шар',
    correctAnswer: 'воздушными шарами',
    explanation: '动词 украсили 表示用某物装饰时要求第五格，复数。',
    case: 5,
    number: '复数'
  },
  {
    id: 32,
    text: 'В расписании нет изменений в вечернее занятие.',
    targetWord: 'вечернее занятие',
    correctAnswer: 'вечерних занятиях',
    explanation: '前置词 в 表示范围时要求第六格，复数。',
    case: 6,
    number: '复数'
  },
  {
    id: 33,
    text: 'Я потерял ключ от входная дверь.',
    targetWord: 'входная дверь',
    correctAnswer: 'входной двери',
    explanation: '前置词 от 表示来源时要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 34,
    text: 'Они остановились у горная река.',
    targetWord: 'горная река',
    correctAnswer: 'горной реки',
    explanation: '前置词 у 要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 35,
    text: 'Бабушка испекла пирог с яблочное варенье.',
    targetWord: 'яблочное варенье',
    correctAnswer: 'яблочным вареньем',
    explanation: '前置词 с 表示内容时要求第五格。',
    case: 5,
    number: '单数'
  },
  {
    id: 36,
    text: 'На собрании наградили лучший работник.',
    targetWord: 'лучший работник',
    correctAnswer: 'лучших работников',
    explanation: '动词 наградили 要求第四格，动物名词复数第四格同第二格。',
    case: 4,
    number: '复数'
  },
  {
    id: 37,
    text: 'В саду посадили красивый цветок.',
    targetWord: 'красивый цветок',
    correctAnswer: 'красивые цветы',
    explanation: '动词 посадили 要求第四格，非动物名词复数第四格同第一格。',
    case: 4,
    number: '复数'
  },
  {
    id: 38,
    text: 'Фильм снят по роману известный писатель.',
    targetWord: 'известный писатель',
    correctAnswer: 'известного писателя',
    explanation: '名词 роману 后接第二格表示作者（по роману известного писателя）。',
    case: 2,
    number: '单数'
  },
  {
    id: 39,
    text: 'Собака бежала за почтовая машина.',
    targetWord: 'почтовая машина',
    correctAnswer: 'почтовой машиной',
    explanation: '前置词 за 表示"跟随"时要求第五格。',
    case: 5,
    number: '单数'
  },
  {
    id: 40,
    text: 'Ученики писали сочинение по прочитанный рассказ.',
    targetWord: 'прочитанный рассказ',
    correctAnswer: 'прочитанным рассказам',
    explanation: '前置词 по 表示依据时要求第三格，复数。',
    case: 3,
    number: '复数'
  },
  {
    id: 41,
    text: 'Мы готовились к трудный экзамен.',
    targetWord: 'трудный экзамен',
    correctAnswer: 'трудному экзамену',
    explanation: '前置词 к 表示准备时要求第三格。',
    case: 3,
    number: '单数'
  },
  {
    id: 42,
    text: 'В корзине лежало много спелая груша.',
    targetWord: 'спелая груша',
    correctAnswer: 'спелых груш',
    explanation: 'много 后接名词复数第二格。',
    case: 2,
    number: '复数'
  },
  {
    id: 43,
    text: 'Друзья обменялись электронное письмо.',
    targetWord: 'электронное письмо',
    correctAnswer: 'электронными письмами',
    explanation: '动词 обменялись 要求第五格，复数。',
    case: 5,
    number: '复数'
  },
  {
    id: 44,
    text: 'На уроке говорили о простое число.',
    targetWord: 'простое число',
    correctAnswer: 'простых числах',
    explanation: '前置词 о 要求第六格，复数。',
    case: 6,
    number: '复数'
  },
  {
    id: 45,
    text: 'Я горжусь старший брат.',
    targetWord: 'старший брат',
    correctAnswer: 'старшим братом',
    explanation: '动词 горжусь 要求第五格。',
    case: 5,
    number: '单数'
  },
  {
    id: 46,
    text: 'В магазине большой выбор зимнее пальто.',
    targetWord: 'зимнее пальто',
    correctAnswer: 'зимних пальто',
    explanation: '名词 выбор 后接第二格，复数，пальто 不变格。',
    case: 2,
    number: '复数'
  },
  {
    id: 47,
    text: 'Дети бежали по мокрая земля после дождя.',
    targetWord: 'мокрая земля',
    correctAnswer: 'мокрой земле',
    explanation: '前置词 по 表示表面移动时要求第三格。',
    case: 3,
    number: '单数'
  },
  {
    id: 48,
    text: 'В книге описана жизнь деревенский учитель.',
    targetWord: 'деревенский учитель',
    correctAnswer: 'деревенского учителя',
    explanation: '名词 жизнь 后接第二格表示"谁的生活"。',
    case: 2,
    number: '单数'
  },
  {
    id: 49,
    text: 'Мы смотрели на полёт быстрая птица.',
    targetWord: 'быстрая птица',
    correctAnswer: 'быстрых птиц',
    explanation: '名词 полёт 后接第二格表示主体，复数。',
    case: 2,
    number: '复数'
  },
  {
    id: 50,
    text: 'К праздничный стол подали торт.',
    targetWord: 'праздничный стол',
    correctAnswer: 'праздничному столу',
    explanation: '前置词 к 表示方向时要求第三格。',
    case: 3,
    number: '单数'
  }
])

// 物主代词+名词组合训练题目数据
const possNounCombinedSentences = ref<Array<{
  id: number
  text: string
  targetWord: string
  correctAnswer: string
  explanation: string
  case: number
  number: string
}>>([
  {
    id: 1,
    text: 'Вчера я купил мой книга в подарок другу.',
    targetWord: 'мой книга',
    correctAnswer: 'мою книгу',
    explanation: '动词 купил 要求第四格。',
    case: 4,
    number: '单数'
  },
  {
    id: 2,
    text: 'Дети радуются наш снег зимой.',
    targetWord: 'наш снег',
    correctAnswer: 'нашему снегу',
    explanation: '动词 радуются 要求第三格。',
    case: 3,
    number: '单数'
  },
  {
    id: 3,
    text: 'Мы любовались твой город вечером.',
    targetWord: 'твой город',
    correctAnswer: 'твоим городом',
    explanation: '动词 любовались 要求第五格。',
    case: 5,
    number: '单数'
  },
  {
    id: 4,
    text: 'На столе не было свой хлеб.',
    targetWord: 'свой хлеб',
    correctAnswer: 'своего хлеба',
    explanation: '否定结构"не было"要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 5,
    text: 'Они встретились у его парк.',
    targetWord: 'его парк',
    correctAnswer: 'его парка',
    explanation: '前置词 у 要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 6,
    text: 'Мама сварила компот из её яблоко.',
    targetWord: 'её яблоко',
    correctAnswer: 'её яблока',
    explanation: '前置词 из 要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 7,
    text: 'Студенты говорили о их фильм.',
    targetWord: 'их фильм',
    correctAnswer: 'их фильмах',
    explanation: '前置词 о 要求第六格，复数。',
    case: 6,
    number: '复数'
  },
  {
    id: 8,
    text: 'В зоопарке дети видели наш животное.',
    targetWord: 'наш животное',
    correctAnswer: 'наших животных',
    explanation: '动词 видели 要求第四格，动物名词复数第四格同第二格。',
    case: 4,
    number: '复数'
  },
  {
    id: 9,
    text: 'Для твой ребенок эта игра не подходит.',
    targetWord: 'твой ребенок',
    correctAnswer: 'твоего ребёнка',
    explanation: '前置词 для 要求第二格，单数。',
    case: 2,
    number: '单数'
  },
  {
    id: 10,
    text: 'Экскурсовод рассказывал о его здание.',
    targetWord: 'его здание',
    correctAnswer: 'его зданиях',
    explanation: '前置词 о 要求第六格，复数。',
    case: 6,
    number: '复数'
  },
  {
    id: 11,
    text: 'Я мечтаю о свой квартира в центре.',
    targetWord: 'свой квартира',
    correctAnswer: 'своей квартире',
    explanation: '动词 мечтаю о 要求第六格。',
    case: 6,
    number: '单数'
  },
  {
    id: 12,
    text: 'Спортсмены гордились мой медаль.',
    targetWord: 'мой медаль',
    correctAnswer: 'моими медалями',
    explanation: '动词 гордились 要求第五格，复数。',
    case: 5,
    number: '复数'
  },
  {
    id: 13,
    text: 'В библиотеке нет учебника по ваш язык.',
    targetWord: 'ваш язык',
    correctAnswer: 'вашему языку',
    explanation: '前置词 по 表示学科时要求第三格。',
    case: 3,
    number: '单数'
  },
  {
    id: 14,
    text: 'Мы шли по её улица.',
    targetWord: 'её улица',
    correctAnswer: 'её улице',
    explanation: '前置词 по 表示"沿着"时要求第三格。',
    case: 3,
    number: '单数'
  },
  {
    id: 15,
    text: 'Художник рисовал портрет наш женщина.',
    targetWord: 'наш женщина',
    correctAnswer: 'нашей женщины',
    explanation: '名词 портрет 后接第二格表示对象。',
    case: 2,
    number: '单数'
  },
  {
    id: 16,
    text: 'Кошка играла с твой мяч.',
    targetWord: 'твой мяч',
    correctAnswer: 'твоим мячом',
    explanation: '前置词 с 表示工具时要求第五格。',
    case: 5,
    number: '单数'
  },
  {
    id: 17,
    text: 'В тексте были ошибки в свой предложение.',
    targetWord: 'свой предложение',
    correctAnswer: 'своих предложениях',
    explanation: '前置词 в 表示范围时要求第六格，复数。',
    case: 6,
    number: '复数'
  },
  {
    id: 18,
    text: 'Друзья купили билеты на его спектакль.',
    targetWord: 'его спектакль',
    correctAnswer: 'его спектакль',
    explanation: '前置词 на 表示方向时要求第四格。',
    case: 4,
    number: '单数'
  },
  {
    id: 19,
    text: 'На выставке показаны работы их художник.',
    targetWord: 'их художник',
    correctAnswer: 'их художников',
    explanation: '名词 работы 后接第二格表示所属，复数。',
    case: 2,
    number: '复数'
  },
  {
    id: 20,
    text: 'Пассажиры ждали ваш поезд.',
    targetWord: 'ваш поезд',
    correctAnswer: 'ваш поезд',
    explanation: '动词 ждали 要求第四格（此处指特定火车，用第四格）。',
    case: 4,
    number: '单数'
  },
  {
    id: 21,
    text: 'Мы говорили о наш каникулы.',
    targetWord: 'наш каникулы',
    correctAnswer: 'наших каникулах',
    explanation: '前置词 о 要求第六格，复数（каникулы 仅有复数形式）。',
    case: 6,
    number: '复数'
  },
  {
    id: 22,
    text: 'Врач выписал лекарство от твой кашель.',
    targetWord: 'твой кашель',
    correctAnswer: 'твоего кашля',
    explanation: '前置词 от 表示原因时要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 23,
    text: 'Девочка угостила подругу мой конфета.',
    targetWord: 'мой конфета',
    correctAnswer: 'моей конфетой',
    explanation: '动词 угостила 要求第五格。',
    case: 5,
    number: '单数'
  },
  {
    id: 24,
    text: 'В статье писали о её проблема.',
    targetWord: 'её проблема',
    correctAnswer: 'её проблемах',
    explanation: '前置词 о 要求第六格，复数。',
    case: 6,
    number: '复数'
  },
  {
    id: 25,
    text: 'Студенты сдали экзамен по свой предмет.',
    targetWord: 'свой предмет',
    correctAnswer: 'своему предмету',
    explanation: '前置词 по 表示学科时要求第三格。',
    case: 3,
    number: '单数'
  },
  {
    id: 26,
    text: 'Рыбаки вернулись с их улов.',
    targetWord: 'их улов',
    correctAnswer: 'их уловом',
    explanation: '前置词 с 表示伴随时要求第五格。',
    case: 5,
    number: '单数'
  },
  {
    id: 27,
    text: 'Для ваш чай нужен сахар.',
    targetWord: 'ваш чай',
    correctAnswer: 'вашего чая',
    explanation: '前置词 для 表示用途时要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 28,
    text: 'Туристы смотрели на наш закат.',
    targetWord: 'наш закат',
    correctAnswer: 'наш закат',
    explanation: '动词 смотрели на 要求第四格。',
    case: 4,
    number: '单数'
  },
  {
    id: 29,
    text: 'В музее есть картины его художник.',
    targetWord: 'его художник',
    correctAnswer: 'его художников',
    explanation: '名词 картины 后接第二格表示作者，复数。',
    case: 2,
    number: '复数'
  },
  {
    id: 30,
    text: 'Ребёнок боится твой звук.',
    targetWord: 'твой звук',
    correctAnswer: 'твоих звуков',
    explanation: '动词 боится 要求第二格，复数。',
    case: 2,
    number: '复数'
  },
  {
    id: 31,
    text: 'Комнату украсили мой шар.',
    targetWord: 'мой шар',
    correctAnswer: 'моими шарами',
    explanation: '动词 украсили 表示用某物装饰时要求第五格，复数。',
    case: 5,
    number: '复数'
  },
  {
    id: 32,
    text: 'В расписании нет изменений в её занятие.',
    targetWord: 'её занятие',
    correctAnswer: 'её занятиях',
    explanation: '前置词 в 表示范围时要求第六格，复数。',
    case: 6,
    number: '复数'
  },
  {
    id: 33,
    text: 'Я потерял ключ от свой дверь.',
    targetWord: 'свой дверь',
    correctAnswer: 'своей двери',
    explanation: '前置词 от 表示来源时要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 34,
    text: 'Они остановились у ваш река.',
    targetWord: 'ваш река',
    correctAnswer: 'вашей реки',
    explanation: '前置词 у 要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 35,
    text: 'Бабушка испекла пирог с наш варенье.',
    targetWord: 'наш варенье',
    correctAnswer: 'нашим вареньем',
    explanation: '前置词 с 表示内容时要求第五格。',
    case: 5,
    number: '单数'
  },
  {
    id: 36,
    text: 'На собрании наградили их работник.',
    targetWord: 'их работник',
    correctAnswer: 'их работников',
    explanation: '动词 наградили 要求第四格，动物名词复数第四格同第二格。',
    case: 4,
    number: '复数'
  },
  {
    id: 37,
    text: 'В саду посадили его цветок.',
    targetWord: 'его цветок',
    correctAnswer: 'его цветы',
    explanation: '动词 посадили 要求第四格，非动物名词复数第四格同第一格。',
    case: 4,
    number: '复数'
  },
  {
    id: 38,
    text: 'Фильм снят по роману твой писатель.',
    targetWord: 'твой писатель',
    correctAnswer: 'твоего писателя',
    explanation: '名词 роману 后接第二格表示作者（по роману твоего писателя）。',
    case: 2,
    number: '单数'
  },
  {
    id: 39,
    text: 'Собака бежала за мой машина.',
    targetWord: 'мой машина',
    correctAnswer: 'моей машиной',
    explanation: '前置词 за 表示"跟随"时要求第五格。',
    case: 5,
    number: '单数'
  },
  {
    id: 40,
    text: 'Ученики писали сочинение по свой рассказ.',
    targetWord: 'свой рассказ',
    correctAnswer: 'своим рассказам',
    explanation: '前置词 по 表示依据时要求第三格，复数。',
    case: 3,
    number: '复数'
  },
  {
    id: 41,
    text: 'Мы готовились к ваш экзамен.',
    targetWord: 'ваш экзамен',
    correctAnswer: 'вашему экзамену',
    explanation: '前置词 к 表示准备时要求第三格。',
    case: 3,
    number: '单数'
  },
  {
    id: 42,
    text: 'В корзине лежало много её груша.',
    targetWord: 'её груша',
    correctAnswer: 'её груш',
    explanation: 'много 后接名词复数第二格。',
    case: 2,
    number: '复数'
  },
  {
    id: 43,
    text: 'Друзья обменялись наш письмо.',
    targetWord: 'наш письмо',
    correctAnswer: 'нашими письмами',
    explanation: '动词 обменялись 要求第五格，复数。',
    case: 5,
    number: '复数'
  },
  {
    id: 44,
    text: 'На уроке говорили о твой число.',
    targetWord: 'твой число',
    correctAnswer: 'твоих числах',
    explanation: '前置词 о 要求第六格，复数。',
    case: 6,
    number: '复数'
  },
  {
    id: 45,
    text: 'Я горжусь свой брат.',
    targetWord: 'свой брат',
    correctAnswer: 'своим братом',
    explanation: '动词 горжусь 要求第五格。',
    case: 5,
    number: '单数'
  },
  {
    id: 46,
    text: 'В магазине большой выбор его пальто.',
    targetWord: 'его пальто',
    correctAnswer: 'его пальто',
    explanation: '名词 выбор 后接第二格，复数，但 пальто 不变格。',
    case: 2,
    number: '复数'
  },
  {
    id: 47,
    text: 'Дети бежали по мой земля после дождя.',
    targetWord: 'мой земля',
    correctAnswer: 'моей земле',
    explanation: '前置词 по 表示表面移动时要求第三格。',
    case: 3,
    number: '单数'
  },
  {
    id: 48,
    text: 'В книге описана жизнь наш учитель.',
    targetWord: 'наш учитель',
    correctAnswer: 'нашего учителя',
    explanation: '名词 жизнь 后接第二格表示"谁的生活"。',
    case: 2,
    number: '单数'
  },
  {
    id: 49,
    text: 'Мы смотрели на полёт её птица.',
    targetWord: 'её птица',
    correctAnswer: 'её птиц',
    explanation: '名词 полёт 后接第二格表示主体，复数。',
    case: 2,
    number: '复数'
  },
  {
    id: 50,
    text: 'К ваш стол подали торт.',
    targetWord: 'ваш стол',
    correctAnswer: 'вашему столу',
    explanation: '前置词 к 表示方向时要求第三格。',
    case: 3,
    number: '单数'
  }
])

// 数词+名词组合训练题目数据
const numNounCombinedSentences = ref<Array<{
  id: number
  text: string
  targetWord: string
  correctAnswer: string
  explanation: string
  case: number
  number: string
  nounOptions?: string[]
  numeralOptions?: string[]
}>>([
  {
    id: 1,
    text: 'У меня есть 1 брат.',
    targetWord: '1 брат',
    correctAnswer: 'один брат',
    explanation: '主格，数词один为阳性单数。',
    case: 1,
    number: '单数'
  },
  {
    id: 2,
    text: 'У неё есть 1 сестра.',
    targetWord: '1 сестра',
    correctAnswer: 'одна сестра',
    explanation: '主格，数词один为阴性单数。',
    case: 1,
    number: '单数'
  },
  {
    id: 3,
    text: 'На столе 1 яблоко.',
    targetWord: '1 яблоко',
    correctAnswer: 'одно яблоко',
    explanation: '前置格，数词один为中性单数。',
    case: 4,
    number: '单数'
  },
  {
    id: 4,
    text: 'У него нет 1 друг.',
    targetWord: '1 друг',
    correctAnswer: 'одного друга',
    explanation: '否定结构нет要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 5,
    text: 'У неё нет 1 книга.',
    targetWord: '1 книга',
    correctAnswer: 'одной книги',
    explanation: '否定结构нет要求第二格。',
    case: 2,
    number: '单数'
  },
  {
    id: 6,
    text: 'Она позвонила 1 подруга.',
    targetWord: '1 подруга',
    correctAnswer: 'одной подруге',
    explanation: '动词позвонить要求第三格。',
    case: 3,
    number: '单数'
  },
  {
    id: 7,
    text: 'Я вижу 1 друг.',
    targetWord: '1 друг',
    correctAnswer: 'одного друга',
    explanation: '动词видеть要求第四格，动物名词第四格同第二格。',
    case: 4,
    number: '单数'
  },
  {
    id: 8,
    text: 'Я горжусь 1 брат.',
    targetWord: '1 брат',
    correctAnswer: 'одним братом',
    explanation: '动词гордиться要求第五格。',
    case: 5,
    number: '单数'
  },
  {
    id: 9,
    text: 'Мы говорили об 1 проблема.',
    targetWord: '1 проблема',
    correctAnswer: 'об одной проблеме',
    explanation: '前置词о要求第六格。',
    case: 6,
    number: '单数'
  },
  {
    id: 10,
    text: 'У меня есть 2 брат.',
    targetWord: '2 брат',
    correctAnswer: 'два брата',
    explanation: '主格，数词два为阳性复数。',
    case: 1,
    number: '复数'
  },
  {
    id: 11,
    text: 'У неё есть 2 сестра.',
    targetWord: '2 сестра',
    correctAnswer: 'две сестры',
    explanation: '主格，数词два为阴性复数。',
    case: 1,
    number: '复数'
  },
  {
    id: 12,
    text: 'На столе 2 яблоко.',
    targetWord: '2 яблоко',
    correctAnswer: 'два яблока',
    explanation: '前置格，数词два为中性复数。',
    case: 4,
    number: '复数'
  },
  {
    id: 13,
    text: 'У него нет 2 друг.',
    targetWord: '2 друг',
    correctAnswer: 'двух друзей',
    explanation: '否定结构нет要求第二格。',
    case: 2,
    number: '复数'
  },
  {
    id: 14,
    text: 'Она позвонила 2 подруга.',
    targetWord: '2 подруга',
    correctAnswer: 'двум подругам',
    explanation: '动词позвонить要求第三格。',
    case: 3,
    number: '复数'
  },
  {
    id: 15,
    text: 'Я купил 2 стол.',
    targetWord: '2 стол',
    correctAnswer: 'два стола',
    explanation: '动词купить要求第四格，非动物名词第四格同第一格。',
    case: 4,
    number: '复数'
  },
  {
    id: 16,
    text: 'Мы гордимся 2 победа.',
    targetWord: '2 победа',
    correctAnswer: 'двумя победами',
    explanation: '动词гордиться要求第五格。',
    case: 5,
    number: '复数'
  },
  {
    id: 17,
    text: 'Они говорят о 2 фильм.',
    targetWord: '2 фильм',
    correctAnswer: 'о двух фильмах',
    explanation: '前置词о要求第六格。',
    case: 6,
    number: '复数'
  },
  {
    id: 18,
    text: 'В классе 3 студент.',
    targetWord: '3 студент',
    correctAnswer: 'три студента',
    explanation: '主格，数词три为阳性复数。',
    case: 1,
    number: '复数'
  },
  {
    id: 19,
    text: 'У меня нет 3 рубль.',
    targetWord: '3 рубль',
    correctAnswer: 'трёх рублей',
    explanation: '否定结构нет要求第二格。',
    case: 2,
    number: '复数'
  },
  {
    id: 20,
    text: 'Я дал книгу 3 ученик.',
    targetWord: '3 ученик',
    correctAnswer: 'трём ученикам',
    explanation: '动词дать要求第三格。',
    case: 3,
    number: '复数'
  },
  {
    id: 21,
    text: 'Я купил 3 билет.',
    targetWord: '3 билет',
    correctAnswer: 'три билета',
    explanation: '动词купить要求第四格，非动物名词第四格同第一格。',
    case: 4,
    number: '复数'
  },
  {
    id: 22,
    text: 'Я встретил 3 друг.',
    targetWord: '3 друг',
    correctAnswer: 'трёх друзей',
    explanation: '动词встретить要求第四格，动物名词第四格同第二格。',
    case: 4,
    number: '复数'
  },
  {
    id: 23,
    text: 'Мы довольны 3 ответ.',
    targetWord: '3 ответ',
    correctAnswer: 'тремя ответами',
    explanation: '形容词доволен要求第五格。',
    case: 5,
    number: '复数'
  },
  {
    id: 24,
    text: 'Они живут в 3 комната.',
    targetWord: '3 комната',
    correctAnswer: 'в трёх комнатах',
    explanation: '前置词в要求第六格。',
    case: 6,
    number: '复数'
  },
  {
    id: 25,
    text: 'На столе 4 книга.',
    targetWord: '4 книга',
    correctAnswer: 'четыре книги',
    explanation: '前置格，数词четыре为阴性复数。',
    case: 4,
    number: '复数'
  },
  {
    id: 26,
    text: 'У неё нет 4 карандаш.',
    targetWord: '4 карандаш',
    correctAnswer: 'четырёх карандашей',
    explanation: '否定结构нет要求第二格。',
    case: 2,
    number: '复数'
  },
  {
    id: 27,
    text: 'Он подарил цветы 4 женщина.',
    targetWord: '4 женщина',
    correctAnswer: 'четырём женщинам',
    explanation: '动词подарить要求第三格。',
    case: 3,
    number: '复数'
  },
  {
    id: 28,
    text: 'Я вижу 4 стол.',
    targetWord: '4 стол',
    correctAnswer: 'четыре стола',
    explanation: '动词видеть要求第四格，非动物名词第四格同第一格。',
    case: 4,
    number: '复数'
  },
  {
    id: 29,
    text: 'Я встретил 4 студент.',
    targetWord: '4 студент',
    correctAnswer: 'четырёх студента',
    explanation: '动词встретить要求第四格，数词2/3/4后接单数2格。',
    case: 4,
    number: '复数',
    nounOptions: ['студента', 'студентов', 'студент']
  },
  {
    id: 30,
    text: 'Они думают о 4 страна.',
    targetWord: '4 страна',
    correctAnswer: 'о четырёх странах',
    explanation: '前置词о要求第六格。',
    case: 6,
    number: '复数'
  },
  {
    id: 31,
    text: 'У меня есть 5 яблоко.',
    targetWord: '5 яблоко',
    correctAnswer: 'пять яблок',
    explanation: '主格，数词пять为中性复数。',
    case: 1,
    number: '复数'
  },
  {
    id: 32,
    text: 'У него нет 5 рубль.',
    targetWord: '5 рубль',
    correctAnswer: 'пяти рублей',
    explanation: '否定结构нет要求第二格。',
    case: 2,
    number: '复数'
  },
  {
    id: 33,
    text: 'Я дал книгу 5 ученик.',
    targetWord: '5 ученик',
    correctAnswer: 'пяти ученикам',
    explanation: '动词дать要求第三格。',
    case: 3,
    number: '复数'
  },
  {
    id: 34,
    text: 'Мы гордимся 5 победа.',
    targetWord: '5 победа',
    correctAnswer: 'пятью победами',
    explanation: '动词гордиться要求第五格。',
    case: 5,
    number: '复数'
  },
  {
    id: 35,
    text: 'В классе 8 студент.',
    targetWord: '8 студент',
    correctAnswer: 'восемь студентов',
    explanation: '主格，数词восемь为阳性复数。',
    case: 1,
    number: '复数'
  },
  {
    id: 36,
    text: 'У неё нет 8 книга.',
    targetWord: '8 книга',
    correctAnswer: 'восьми книг',
    explanation: '否定结构нет要求第二格。',
    case: 2,
    number: '复数'
  },
  {
    id: 37,
    text: 'Она позвонила 8 друг.',
    targetWord: '8 друг',
    correctAnswer: 'восьми друзьям',
    explanation: '动词позвонить要求第三格。',
    case: 3,
    number: '复数'
  },
  {
    id: 38,
    text: 'На столе 10 тетрадь.',
    targetWord: '10 тетрадь',
    correctAnswer: 'десять тетрадей',
    explanation: '前置格，数词десять为阴性复数。',
    case: 4,
    number: '复数',
    numeralOptions: ['десять', 'десяти', 'десятью']
  },
  {
    id: 39,
    text: 'У меня нет 10 рубль.',
    targetWord: '10 рубль',
    correctAnswer: 'десяти рублей',
    explanation: '否定结构нет要求第二格。',
    case: 2,
    number: '复数',
    numeralOptions: ['десяти', 'десять', 'десятью']
  },
  {
    id: 40,
    text: 'Они говорят о 10 страна.',
    targetWord: '10 страна',
    correctAnswer: 'о десяти странах',
    explanation: '前置词о要求第六格。',
    case: 6,
    number: '复数',
    numeralOptions: ['десяти', 'десять', 'десятью']
  },
  {
    id: 41,
    text: 'В библиотеке 25 книга.',
    targetWord: '25 книга',
    correctAnswer: 'двадцать пять книг',
    explanation: '前置格，复合数词前后都要变格。',
    case: 4,
    number: '复数',
    numeralOptions: ['двадцать пять', 'двадцати пяти', 'двадцатью пятью']
  },
  {
    id: 42,
    text: 'У меня нет 25 рубль.',
    targetWord: '25 рубль',
    correctAnswer: 'двадцати пяти рублей',
    explanation: '否定结构нет要求第二格，复合数词前后都要变格。',
    case: 2,
    number: '复数',
    nounOptions: ['рублей', 'рубля', 'рубль'],
    numeralOptions: ['двадцати пяти', 'двадцать пять', 'двадцатью пятью']
  },
  {
    id: 43,
    text: 'Я подарил цветы 48 женщина.',
    targetWord: '48 женщина',
    correctAnswer: 'сорока восьми женщинам',
    explanation: '动词подарить要求第三格，复合数词前后都要变格。',
    case: 3,
    number: '复数',
    nounOptions: ['женщинам', 'женщин', 'женщина'],
    numeralOptions: ['сорока восьми', 'сорок восемь', 'сорок восемью']
  },
  {
    id: 44,
    text: 'Мы гордимся 25 ученик.',
    targetWord: '25 ученик',
    correctAnswer: 'двадцатью пятью учениками',
    explanation: '动词гордиться要求第五格，复合数词前后都要变格。',
    case: 5,
    number: '复数',
    nounOptions: ['учениками', 'учеников', 'ученик'],
    numeralOptions: ['двадцатью пятью', 'двадцать пять', 'двадцати пяти']
  },
  {
    id: 45,
    text: 'Они говорили о 48 страна.',
    targetWord: '48 страна',
    correctAnswer: 'о сорока восьми странах',
    explanation: '前置词о要求第六格，复合数词前后都要变格。',
    case: 6,
    number: '复数',
    nounOptions: ['странах', 'стран', 'страна'],
    numeralOptions: ['сорока восьми', 'сорок восемь', 'сорок восемью']
  }
])

// 物主代词训练题目数据
const possessiveTrainingSentences = ref<Array<{
  id: number
  text: string
  targetWord: string
  originalEnding: string
  correctEnding: string
  possibleEndings: string[]
  explanation: string
  case: number
  gender: string
}>>([
  // мой (12题)
  {
    id: 1,
    text: 'Это мой дом.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '1格阳性，修饰阳性名词дом，词尾无变化。',
    case: 1,
    gender: '阳性'
  },
  {
    id: 2,
    text: 'Это моё окно.',
    targetWord: 'моё',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '1格中性，词尾 -ё。',
    case: 1,
    gender: '中性'
  },
  {
    id: 3,
    text: 'У меня нет мой брата.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', '/', 'ему', 'им'],
    explanation: '2格，修饰阳性名词брата，词尾 -его。',
    case: 2,
    gender: '阳性'
  },
  {
    id: 4,
    text: 'У него нет моё времени.',
    targetWord: 'моё',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', '/', 'ему', 'им'],
    explanation: '2格，修饰中性名词времени，词尾 -его（阳中同形）。',
    case: 2,
    gender: '中性'
  },
  {
    id: 5,
    text: 'Я иду к мой другу.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'ему',
    possibleEndings: ['ему', 'его', '/', 'им'],
    explanation: '3格，修饰阳性名词другу，词尾 -ему。',
    case: 3,
    gender: '阳性'
  },
  {
    id: 6,
    text: 'Мы подошли к моё зданию.',
    targetWord: 'моё',
    originalEnding: '',
    correctEnding: 'ему',
    possibleEndings: ['ему', 'его', '/', 'им'],
    explanation: '3格，修饰中性名词зданию，词尾 -ему（阳中同形）。',
    case: 3,
    gender: '中性'
  },
  {
    id: 7,
    text: 'Я вижу мой стол.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '4格阳性非动物，同1格，词尾无变化。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 8,
    text: 'Я встретил мой брата.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', '/', 'ему', 'им'],
    explanation: '4格阳性动物，同2格，词尾 -его。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 9,
    text: 'Она взяла моё пальто.',
    targetWord: 'моё',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '4格中性，同1格，词尾 -ё。',
    case: 4,
    gender: '中性'
  },
  {
    id: 10,
    text: 'Я горжусь мой домом.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'его', 'ему', '/'],
    explanation: '5格，修饰阳性名词домом，词尾 -им。',
    case: 5,
    gender: '阳性'
  },
  {
    id: 11,
    text: 'Мы гордимся моё достижением.',
    targetWord: 'моё',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'его', 'ему', '/'],
    explanation: '5格，修饰中性名词достижением，词尾 -им（阳中同形）。',
    case: 5,
    gender: '中性'
  },
  {
    id: 12,
    text: 'Я думаю о мой доме.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'ём',
    possibleEndings: ['ём', 'его', 'ему', 'им'],
    explanation: '6格，修饰阳性名词доме，词尾 -ём。',
    case: 6,
    gender: '阳性'
  },
  // твой (12题)
  {
    id: 13,
    text: 'Это твой учебник.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '1格阳性，词尾无变化。',
    case: 1,
    gender: '阳性'
  },
  {
    id: 14,
    text: 'Это твоё письмо.',
    targetWord: 'твоё',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '1格中性，词尾 -ё。',
    case: 1,
    gender: '中性'
  },
  {
    id: 15,
    text: 'У нас нет твой адреса.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', '/', 'ему', 'им'],
    explanation: '2格，修饰阳性名词адреса，词尾 -его。',
    case: 2,
    gender: '阳性'
  },
  {
    id: 16,
    text: 'У неё нет твоё мнения.',
    targetWord: 'твоё',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', '/', 'ему', 'им'],
    explanation: '2格，修饰中性名词мнения，词尾 -его（阳中同形）。',
    case: 2,
    gender: '中性'
  },
  {
    id: 17,
    text: 'Я иду к твой дому.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'ему',
    possibleEndings: ['ему', 'его', '/', 'им'],
    explanation: '3格，修饰阳性名词дому，词尾 -ему。',
    case: 3,
    gender: '阳性'
  },
  {
    id: 18,
    text: 'Мы приблизились к твоё озеру.',
    targetWord: 'твоё',
    originalEnding: '',
    correctEnding: 'ему',
    possibleEndings: ['ему', 'его', '/', 'им'],
    explanation: '3格，修饰中性名词озеру，词尾 -ему（阳中同形）。',
    case: 3,
    gender: '中性'
  },
  {
    id: 19,
    text: 'Я купил твой компьютер.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '4格阳性非动物，同1格。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 20,
    text: 'Он ждёт твой друга.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', '/', 'ему', 'им'],
    explanation: '4格阳性动物，同2格，词尾 -его。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 21,
    text: 'Мы увидели твоё море.',
    targetWord: 'твоё',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '4格中性，同1格，词尾 -ё。',
    case: 4,
    gender: '中性'
  },
  {
    id: 22,
    text: 'Я интересуюсь твой вопросом.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'его', 'ему', '/'],
    explanation: '5格，修饰阳性名词вопросом，词尾 -им。',
    case: 5,
    gender: '阳性'
  },
  {
    id: 23,
    text: 'Она довольна твоё решением.',
    targetWord: 'твоё',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'его', 'ему', '/'],
    explanation: '5格，修饰中性名词решением，词尾 -им（阳中同形）。',
    case: 5,
    gender: '中性'
  },
  {
    id: 24,
    text: 'Мы говорили о твой успехе.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'ём',
    possibleEndings: ['ём', 'его', 'ему', 'им'],
    explanation: '6格，修饰阳性名词успехе，词尾 -ём。',
    case: 6,
    gender: '阳性'
  },
  // наш (12题)
  {
    id: 25,
    text: 'Это наш город.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '1格阳性，词尾无变化。',
    case: 1,
    gender: '阳性'
  },
  {
    id: 26,
    text: 'Это наше здание.',
    targetWord: 'наше',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '1格中性，词尾 -е。',
    case: 1,
    gender: '中性'
  },
  {
    id: 27,
    text: 'У нас нет наш учителя.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', '/', 'ему', 'им'],
    explanation: '2格，修饰阳性名词учителя，词尾 -его。',
    case: 2,
    gender: '阳性'
  },
  {
    id: 28,
    text: 'У них нет наше времени.',
    targetWord: 'наше',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', '/', 'ему', 'им'],
    explanation: '2格，修饰中性名词времени，词尾 -его（阳中同形）。',
    case: 2,
    gender: '中性'
  },
  {
    id: 29,
    text: 'Мы подошли к наш дому.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'ему',
    possibleEndings: ['ему', 'его', '/', 'им'],
    explanation: '3格，修饰阳性名词дому，词尾 -ему。',
    case: 3,
    gender: '阳性'
  },
  {
    id: 30,
    text: 'Дети бегут к наше морю.',
    targetWord: 'наше',
    originalEnding: '',
    correctEnding: 'ему',
    possibleEndings: ['ему', 'его', '/', 'им'],
    explanation: '3格，修饰中性名词морю，词尾 -ему（阳中同形）。',
    case: 3,
    gender: '中性'
  },
  {
    id: 31,
    text: 'Я люблю наш парк.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '4格阳性非动物，同1格。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 32,
    text: 'Мы пригласили наш соседа.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', '/', 'ему', 'им'],
    explanation: '4格阳性动物，同2格，词尾 -его。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 33,
    text: 'Они видят наше озеро.',
    targetWord: 'наше',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '4格中性，同1格，词尾 -е。',
    case: 4,
    gender: '中性'
  },
  {
    id: 34,
    text: 'Мы гордимся наш университетом.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'его', 'ему', '/'],
    explanation: '5格，修饰阳性名词университетом，词尾 -им。',
    case: 5,
    gender: '阳性'
  },
  {
    id: 35,
    text: 'Мы любуемся наше морем.',
    targetWord: 'наше',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'его', 'ему', '/'],
    explanation: '5格，修饰中性名词морем，词尾 -им（阳中同形）。',
    case: 5,
    gender: '中性'
  },
  {
    id: 36,
    text: 'Мы говорили о наш городе.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'ем',
    possibleEndings: ['ем', 'его', 'ему', 'им'],
    explanation: '6格，修饰阳性名词городе，词尾 -ем。',
    case: 6,
    gender: '阳性'
  },
  // ваш (12题)
  {
    id: 37,
    text: 'Это ваш билет.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '1格阳性，词尾无变化。',
    case: 1,
    gender: '阳性'
  },
  {
    id: 38,
    text: 'Это ваше место.',
    targetWord: 'ваше',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '1格中性，词尾 -е。',
    case: 1,
    gender: '中性'
  },
  {
    id: 39,
    text: 'У меня нет ваш ключа.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', '/', 'ему', 'им'],
    explanation: '2格，修饰阳性名词ключа，词尾 -его。',
    case: 2,
    gender: '阳性'
  },
  {
    id: 40,
    text: 'У него нет ваше согласия.',
    targetWord: 'ваше',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', '/', 'ему', 'им'],
    explanation: '2格，修饰中性名词согласия，词尾 -его（阳中同形）。',
    case: 2,
    gender: '中性'
  },
  {
    id: 41,
    text: 'Я пойду к ваш дому.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'ему',
    possibleEndings: ['ему', 'его', '/', 'им'],
    explanation: '3格，修饰阳性名词дому，词尾 -ему。',
    case: 3,
    gender: '阳性'
  },
  {
    id: 42,
    text: 'Мы едем к ваше озеру.',
    targetWord: 'ваше',
    originalEnding: '',
    correctEnding: 'ему',
    possibleEndings: ['ему', 'его', '/', 'им'],
    explanation: '3格，修饰中性名词озеру，词尾 -ему（阳中同形）。',
    case: 3,
    gender: '中性'
  },
  {
    id: 43,
    text: 'Я возьму ваш словарь.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '4格阳性非动物，同1格。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 44,
    text: 'Я жду ваш брата.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', '/', 'ему', 'им'],
    explanation: '4格阳性动物，同2格，词尾 -его。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 45,
    text: 'Мы увидели ваше поле.',
    targetWord: 'ваше',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '4格中性，同1格，词尾 -е。',
    case: 4,
    gender: '中性'
  },
  {
    id: 46,
    text: 'Я доволен ваш ответом.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'его', 'ему', '/'],
    explanation: '5格，修饰阳性名词ответом，词尾 -им。',
    case: 5,
    gender: '阳性'
  },
  {
    id: 47,
    text: 'Он интересуется ваше предложением.',
    targetWord: 'ваше',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'его', 'ему', '/'],
    explanation: '5格，修饰中性名词предложением，词尾 -им（阳中同形）。',
    case: 5,
    gender: '中性'
  },
  {
    id: 48,
    text: 'Мы думаем о ваш предложении.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'ем',
    possibleEndings: ['ем', 'его', 'ему', 'им'],
    explanation: '6格，修饰阳性名词предложении，词尾 -ем。',
    case: 6,
    gender: '阳性'
  },
  // свой (4题)
  {
    id: 49,
    text: 'У меня есть свой дом.',
    targetWord: 'свой',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '1格阳性，词尾无变化。',
    case: 1,
    gender: '阳性'
  },
  {
    id: 50,
    text: 'У него есть своё дело.',
    targetWord: 'своё',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '1格中性，词尾 -ё。',
    case: 1,
    gender: '中性'
  },
  {
    id: 51,
    text: 'У меня нет свой брата.',
    targetWord: 'свой',
    originalEnding: '',
    correctEnding: 'его',
    possibleEndings: ['его', '/', 'ему', 'им'],
    explanation: '2格，修饰阳性名词брата，词尾 -его。',
    case: 2,
    gender: '阳性'
  },
  {
    id: 52,
    text: 'Я люблю свой город.',
    targetWord: 'свой',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '4格阳性非动物，同1格（常见格）。',
    case: 4,
    gender: '阳性'
  },
  // весь (4题)
  {
    id: 53,
    text: 'Весь мир знает это.',
    targetWord: 'Весь',
    originalEnding: '',
    correctEnding: 'весь',
    possibleEndings: ['весь', 'всего', 'вему', 'вем'],
    explanation: '1格阳性，词尾无变化。',
    case: 1,
    gender: '阳性'
  },
  {
    id: 54,
    text: 'Всё время прошло.',
    targetWord: 'Всё',
    originalEnding: '',
    correctEnding: 'всё',
    possibleEndings: ['всё', 'всего', 'вему', 'вем'],
    explanation: '1格中性，词尾 -ё。',
    case: 1,
    gender: '中性'
  },
  {
    id: 55,
    text: 'Я вижу весь город.',
    targetWord: 'весь',
    originalEnding: '',
    correctEnding: 'весь',
    possibleEndings: ['весь', 'всего', 'вему', 'вем'],
    explanation: '4格阳性非动物，同1格（常见格）。',
    case: 4,
    gender: '阳性'
  },
  {
    id: 56,
    text: 'Он доволен весь миром.',
    targetWord: 'весь',
    originalEnding: '',
    correctEnding: 'всем',
    possibleEndings: ['всем', 'весь', 'всего', 'вему'],
    explanation: '5格，修饰阳性名词миром，词尾 -ем（常见格）。',
    case: 5,
    gender: '阳性'
  },
  // чей (4题)
  {
    id: 57,
    text: 'Чей это дом?',
    targetWord: 'Чей',
    originalEnding: '',
    correctEnding: 'чей',
    possibleEndings: ['чей', 'чьего', 'чему', 'чьём'],
    explanation: '1格阳性，词尾无变化。',
    case: 1,
    gender: '阳性'
  },
  {
    id: 58,
    text: 'Чьё это окно?',
    targetWord: 'Чьё',
    originalEnding: '',
    correctEnding: 'чьё',
    possibleEndings: ['чьё', 'чьего', 'чему', 'чьём'],
    explanation: '1格中性，词尾 -ё。',
    case: 1,
    gender: '中性'
  },
  {
    id: 59,
    text: 'У тебя нет чей адреса?',
    targetWord: 'чей',
    originalEnding: '',
    correctEnding: 'чьего',
    possibleEndings: ['чьего', 'чей', 'чему', 'чьём'],
    explanation: '2格，修饰阳性名词адреса，词尾 -его（常见格）。',
    case: 2,
    gender: '阳性'
  },
  {
    id: 60,
    text: 'Я вижу чей стол?',
    targetWord: 'чей',
    originalEnding: '',
    correctEnding: 'чей',
    possibleEndings: ['чей', 'чьего', 'чему', 'чьём'],
    explanation: '4格阳性非动物，同1格（常见格）。',
    case: 4,
    gender: '阳性'
  },
  // 补充题 (5题)
  {
    id: 61,
    text: 'Мы видим наше поле.',
    targetWord: 'наше',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '4格中性，同1格，词尾 -е。',
    case: 4,
    gender: '中性'
  },
  {
    id: 62,
    text: 'Она взяла своё кольцо.',
    targetWord: 'своё',
    originalEnding: '',
    correctEnding: '/',
    possibleEndings: ['/', 'его', 'ему', 'им'],
    explanation: '4格中性，同1格，词尾 -ё。',
    case: 4,
    gender: '中性'
  },
  {
    id: 63,
    text: 'Он гордится свой успехом.',
    targetWord: 'свой',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', '/', 'его', 'ему'],
    explanation: '5格，修饰阳性名词успехом，词尾 -им。',
    case: 5,
    gender: '阳性'
  },
  {
    id: 64,
    text: 'О чей доме ты говоришь?',
    targetWord: 'чей',
    originalEnding: '',
    correctEnding: 'чьём',
    possibleEndings: ['чьём', 'чей', 'чьего', 'чему'],
    explanation: '6格，修饰阳性名词доме，词尾 -ём。',
    case: 6,
    gender: '阳性'
  },
  {
    id: 65,
    text: 'Я встретил весь человека.',
    targetWord: 'весь',
    originalEnding: '',
    correctEnding: 'всего',
    possibleEndings: ['всего', 'весь', 'вему', 'вем'],
    explanation: '4格阳性动物，同2格，词尾 -его（修饰человека）。',
    case: 4,
    gender: '阳性'
  },
  // 阴性单数训练 - мой (12题)
  {
    id: 66,
    text: 'Это мой книга.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'я',
    possibleEndings: ['я', 'й', 'ей', 'ю'],
    explanation: '1格，修饰阴性名词книга，词尾 -я。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 67,
    text: 'Мой сестра пришла.',
    targetWord: 'Мой',
    originalEnding: '',
    correctEnding: 'я',
    possibleEndings: ['я', 'й', 'ей', 'ю'],
    explanation: '1格，修饰阴性名词сестра，词尾 -я。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 68,
    text: 'У меня нет мой книги.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '2格，修饰阴性名词книги，词尾 -ей。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 69,
    text: 'Цвет мой розы красный.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '2格，修饰阴性名词розы，词尾 -ей。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 70,
    text: 'Я иду к мой подруге.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '3格，修饰阴性名词подруге，词尾 -ей。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 71,
    text: 'По мой улице ходят люди.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '3格，修饰阴性名词улице，词尾 -ей。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 72,
    text: 'Я вижу мой машину.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'ю',
    possibleEndings: ['ю', 'й', 'я', 'ей'],
    explanation: '4格，修饰阴性名词машину，词尾 -ю。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 73,
    text: 'Она любит мой сестру.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'ю',
    possibleEndings: ['ю', 'й', 'я', 'ей'],
    explanation: '4格，修饰阴性名词сестру，词尾 -ю。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 74,
    text: 'Я горжусь мой работой.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '5格，修饰阴性名词работой，词尾 -ей。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 75,
    text: 'Она довольна мой оценкой.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '5格，修饰阴性名词оценкой，词尾 -ей。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 76,
    text: 'Мы говорили о мой книге.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '6格，修饰阴性名词книге，词尾 -ей。',
    case: 6,
    gender: '阴性'
  },
  {
    id: 77,
    text: 'Он думает о мой сестре.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '6格，修饰阴性名词сестре，词尾 -ей。',
    case: 6,
    gender: '阴性'
  },
  // твой (12题)
  {
    id: 78,
    text: 'Это твой книга.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'я',
    possibleEndings: ['я', 'й', 'ей', 'ю'],
    explanation: '1格，修饰阴性名词книга，词尾 -я。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 79,
    text: 'Твой мама здесь.',
    targetWord: 'Твой',
    originalEnding: '',
    correctEnding: 'я',
    possibleEndings: ['я', 'й', 'ей', 'ю'],
    explanation: '1格，修饰阴性名词мама，词尾 -я。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 80,
    text: 'У нас нет твой ручки.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '2格，修饰阴性名词ручки，词尾 -ей。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 81,
    text: 'Цвет твой кофты яркий.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '2格，修饰阴性名词кофты，词尾 -ей。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 82,
    text: 'Я иду к твой бабушке.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '3格，修饰阴性名词бабушке，词尾 -ей。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 83,
    text: 'По твой улице едут машины.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '3格，修饰阴性名词улице，词尾 -ей。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 84,
    text: 'Я взял твой тетрадь.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'ю',
    possibleEndings: ['ю', 'й', 'я', 'ей'],
    explanation: '4格，修饰阴性名词тетрадь，词尾 -ю。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 85,
    text: 'Он ждёт твой подругу.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'ю',
    possibleEndings: ['ю', 'й', 'я', 'ей'],
    explanation: '4格，修饰阴性名词подругу，词尾 -ю。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 86,
    text: 'Я интересуюсь твой идеей.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '5格，修饰阴性名词идеей，词尾 -ей。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 87,
    text: 'Она любуется твой картиной.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '5格，修饰阴性名词картиной，词尾 -ей。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 88,
    text: 'Мы говорили о твой работе.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '6格，修饰阴性名词работе，词尾 -ей。',
    case: 6,
    gender: '阴性'
  },
  {
    id: 89,
    text: 'Он думает о твой семье.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '6格，修饰阴性名词семье，词尾 -ей。',
    case: 6,
    gender: '阴性'
  },
  // наш (12题)
  {
    id: 90,
    text: 'Это наш школа.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'а',
    possibleEndings: ['а', 'ш', 'ей', 'у'],
    explanation: '1格，修饰阴性名词школа，词尾 -а。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 91,
    text: 'Наш комната большая.',
    targetWord: 'Наш',
    originalEnding: '',
    correctEnding: 'а',
    possibleEndings: ['а', 'ш', 'ей', 'у'],
    explanation: '1格，修饰阴性名词комната，词尾 -а。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 92,
    text: 'У нас нет наш учительницы.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '2格，修饰阴性名词учительницы，词尾 -ей。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 93,
    text: 'Адрес наш квартиры известен.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '2格，修饰阴性名词квартиры，词尾 -ей。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 94,
    text: 'Мы идём к наш бабушке.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '3格，修饰阴性名词бабушке，词尾 -ей。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 95,
    text: 'По наш улице ходит автобус.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '3格，修饰阴性名词улице，词尾 -ей。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 96,
    text: 'Я люблю наш родину.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'у',
    possibleEndings: ['у', 'ш', 'а', 'ей'],
    explanation: '4格，修饰阴性名词родину，词尾 -у。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 97,
    text: 'Мы пригласили наш соседку.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'у',
    possibleEndings: ['у', 'ш', 'а', 'ей'],
    explanation: '4格，修饰阴性名词соседку，词尾 -у。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 98,
    text: 'Мы гордимся наш победой.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '5格，修饰阴性名词победой，词尾 -ей。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 99,
    text: 'Она довольна наш работой.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '5格，修饰阴性名词работой，词尾 -ей。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 100,
    text: 'Мы говорили о наш поездке.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '6格，修饰阴性名词поездке，词尾 -ей。',
    case: 6,
    gender: '阴性'
  },
  {
    id: 101,
    text: 'Он думает о наш семье.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '6格，修饰阴性名词семье，词尾 -ей。',
    case: 6,
    gender: '阴性'
  },
  // ваш (12题)
  {
    id: 102,
    text: 'Это ваш книга.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'а',
    possibleEndings: ['а', 'ш', 'ей', 'у'],
    explanation: '1格，修饰阴性名词книга，词尾 -а。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 103,
    text: 'Ваш дача красивая.',
    targetWord: 'Ваш',
    originalEnding: '',
    correctEnding: 'а',
    possibleEndings: ['а', 'ш', 'ей', 'у'],
    explanation: '1格，修饰阴性名词дача，词尾 -а。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 104,
    text: 'У меня нет ваш ручки.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '2格，修饰阴性名词ручки，词尾 -ей。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 105,
    text: 'Цвет ваш машины синий.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '2格，修饰阴性名词машины，词尾 -ей。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 106,
    text: 'Я пойду к ваш подруге.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '3格，修饰阴性名词подруге，词尾 -ей。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 107,
    text: 'По ваш улице мы гуляли.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '3格，修饰阴性名词улице，词尾 -ей。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 108,
    text: 'Я возьму ваш тетрадь.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'у',
    possibleEndings: ['у', 'ш', 'а', 'ей'],
    explanation: '4格，修饰阴性名词тетрадь，词尾 -у。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 109,
    text: 'Мы ждём ваш сестру.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'у',
    possibleEndings: ['у', 'ш', 'а', 'ей'],
    explanation: '4格，修饰阴性名词сестру，词尾 -у。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 110,
    text: 'Я доволен ваш помощью.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '5格，修饰阴性名词помощью，词尾 -ей。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 111,
    text: 'Он интересуется ваш идеей.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '5格，修饰阴性名词идеей，词尾 -ей。',
    case: 5,
    gender: '阴性'
  },
  {
    id: 112,
    text: 'Мы думаем о ваш работе.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '6格，修饰阴性名词работе，词尾 -ей。',
    case: 6,
    gender: '阴性'
  },
  {
    id: 113,
    text: 'Они говорили о ваш семье.',
    targetWord: 'ваш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '6格，修饰阴性名词семье，词尾 -ей。',
    case: 6,
    gender: '阴性'
  },
  // свой (4题)
  {
    id: 114,
    text: 'У меня есть свой машина.',
    targetWord: 'свой',
    originalEnding: '',
    correctEnding: 'я',
    possibleEndings: ['я', 'й', 'ей', 'ю'],
    explanation: '1格，修饰阴性名词машина，词尾 -я。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 115,
    text: 'У него нет свой книги.',
    targetWord: 'свой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '2格，修饰阴性名词книги，词尾 -ей。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 116,
    text: 'Она любит свой работу.',
    targetWord: 'свой',
    originalEnding: '',
    correctEnding: 'ю',
    possibleEndings: ['ю', 'й', 'я', 'ей'],
    explanation: '4格，修饰阴性名词работу，词尾 -ю。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 117,
    text: 'Он гордится свой победой.',
    targetWord: 'свой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '5格，修饰阴性名词победой，词尾 -ей。',
    case: 5,
    gender: '阴性'
  },
  // весь (4题)
  {
    id: 118,
    text: 'Весь страна знает это.',
    targetWord: 'Весь',
    originalEnding: '',
    correctEnding: 'Вся',
    possibleEndings: ['Вся', 'Весь', 'Всей', 'Всю'],
    explanation: '1格，修饰阴性名词страна，词尾 -я。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 119,
    text: 'У меня нет весь информации.',
    targetWord: 'весь',
    originalEnding: '',
    correctEnding: 'всей',
    possibleEndings: ['всей', 'весь', 'вся', 'всю'],
    explanation: '2格，修饰阴性名词информации，词尾 -ей。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 120,
    text: 'Я вижу весь картину.',
    targetWord: 'весь',
    originalEnding: '',
    correctEnding: 'всю',
    possibleEndings: ['всю', 'весь', 'вся', 'всей'],
    explanation: '4格，修饰阴性名词картину，词尾 -ю。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 121,
    text: 'Он доволен весь жизнью.',
    targetWord: 'весь',
    originalEnding: '',
    correctEnding: 'всей',
    possibleEndings: ['всей', 'весь', 'вся', 'всю'],
    explanation: '5格，修饰阴性名词жизнью，词尾 -ей。',
    case: 5,
    gender: '阴性'
  },
  // чей (4题)
  {
    id: 122,
    text: 'Чей это книга?',
    targetWord: 'Чей',
    originalEnding: '',
    correctEnding: 'Чья',
    possibleEndings: ['Чья', 'Чей', 'Чьей', 'Чью'],
    explanation: '1格，修饰阴性名词книга，词尾 -я。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 123,
    text: 'У тебя нет чей ручки?',
    targetWord: 'чей',
    originalEnding: '',
    correctEnding: 'чьей',
    possibleEndings: ['чьей', 'чей', 'чья', 'чью'],
    explanation: '2格，修饰阴性名词ручки，词尾 -ей。',
    case: 2,
    gender: '阴性'
  },
  {
    id: 124,
    text: 'Я вижу чей машину?',
    targetWord: 'чей',
    originalEnding: '',
    correctEnding: 'чью',
    possibleEndings: ['чью', 'чей', 'чья', 'чьей'],
    explanation: '4格，修饰阴性名词машину，词尾 -ю。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 125,
    text: 'О чей сестре ты говоришь?',
    targetWord: 'чей',
    originalEnding: '',
    correctEnding: 'чьей',
    possibleEndings: ['чьей', 'чей', 'чья', 'чью'],
    explanation: '6格，修饰阴性名词сестре，词尾 -ей。',
    case: 6,
    gender: '阴性'
  },
  // 补充题 (5题)
  {
    id: 126,
    text: 'Это мой старая фотография.',
    targetWord: 'мой',
    originalEnding: '',
    correctEnding: 'я',
    possibleEndings: ['я', 'й', 'ей', 'ю'],
    explanation: '1格，修饰阴性名词фотография，词尾 -я。',
    case: 1,
    gender: '阴性'
  },
  {
    id: 127,
    text: 'Мы рады наш новой победе.',
    targetWord: 'наш',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'ш', 'а', 'у'],
    explanation: '3格，修饰阴性名词победе，词尾 -ей。',
    case: 3,
    gender: '阴性'
  },
  {
    id: 128,
    text: 'Он взял свой тетрадь.',
    targetWord: 'свой',
    originalEnding: '',
    correctEnding: 'ю',
    possibleEndings: ['ю', 'й', 'я', 'ей'],
    explanation: '4格，修饰阴性名词тетрадь，词尾 -ю。',
    case: 4,
    gender: '阴性'
  },
  {
    id: 129,
    text: 'Я думаю о твой маме.',
    targetWord: 'твой',
    originalEnding: '',
    correctEnding: 'ей',
    possibleEndings: ['ей', 'й', 'я', 'ю'],
    explanation: '6格，修饰阴性名词маме，词尾 -ей。',
    case: 6,
    gender: '阴性'
  },
  {
    id: 130,
    text: 'Весь группа собралась.',
    targetWord: 'Весь',
    originalEnding: '',
    correctEnding: 'Вся',
    possibleEndings: ['Вся', 'Весь', 'Всей', 'Всю'],
    explanation: '1格，修饰阴性名词группа，词尾 -я。',
    case: 1,
    gender: '阴性'
  },
  // 复数训练
  {
    id: 131,
    text: 'Это мои друзья.',
    targetWord: 'мои',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '1格，复数物主代词1格词尾 -и。',
    case: 1,
    gender: '复数'
  },
  {
    id: 132,
    text: 'Мои книги на столе.',
    targetWord: 'Мои',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '1格，复数物主代词1格词尾 -и。',
    case: 1,
    gender: '复数'
  },
  {
    id: 133,
    text: 'У тебя нет мои друзей.',
    targetWord: 'мои',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '2格，复数物主代词2格词尾 -их。',
    case: 2,
    gender: '复数'
  },
  {
    id: 134,
    text: 'Цена мои машин высока.',
    targetWord: 'мои',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '2格，复数物主代词2格词尾 -их。',
    case: 2,
    gender: '复数'
  },
  {
    id: 135,
    text: 'Я иду к мои друзьям.',
    targetWord: 'мои',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'и', 'их', 'ими'],
    explanation: '3格，复数物主代词3格词尾 -им。',
    case: 3,
    gender: '复数'
  },
  {
    id: 136,
    text: 'По мои улицам ходят люди.',
    targetWord: 'мои',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'и', 'их', 'ими'],
    explanation: '3格，复数物主代词3格词尾 -им。',
    case: 3,
    gender: '复数'
  },
  {
    id: 137,
    text: 'Я вижу мои книги.',
    targetWord: 'мои',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '4格非动物，同1格，词尾 -и。',
    case: 4,
    gender: '复数'
  },
  {
    id: 138,
    text: 'Я встретил мои друзей.',
    targetWord: 'мои',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '4格动物，同2格，词尾 -их。',
    case: 4,
    gender: '复数'
  },
  {
    id: 139,
    text: 'Я горжусь мои друзьями.',
    targetWord: 'мои',
    originalEnding: '',
    correctEnding: 'ими',
    possibleEndings: ['ими', 'и', 'их', 'им'],
    explanation: '5格，复数物主代词5格词尾 -ими。',
    case: 5,
    gender: '复数'
  },
  {
    id: 140,
    text: 'Мы любуемся мои картинами.',
    targetWord: 'мои',
    originalEnding: '',
    correctEnding: 'ими',
    possibleEndings: ['ими', 'и', 'их', 'им'],
    explanation: '5格，复数物主代词5格词尾 -ими。',
    case: 5,
    gender: '复数'
  },
  {
    id: 141,
    text: 'Мы говорили о мои книгах.',
    targetWord: 'мои',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '6格，复数物主代词6格词尾 -их。',
    case: 6,
    gender: '复数'
  },
  {
    id: 142,
    text: 'Он думает о мои друзьях.',
    targetWord: 'мои',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '6格，复数物主代词6格词尾 -их。',
    case: 6,
    gender: '复数'
  },
  {
    id: 143,
    text: 'Это твои друзья.',
    targetWord: 'твои',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '1格，复数物主代词1格词尾 -и。',
    case: 1,
    gender: '复数'
  },
  {
    id: 144,
    text: 'Твои письма пришли.',
    targetWord: 'Твои',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '1格，复数物主代词1格词尾 -и。',
    case: 1,
    gender: '复数'
  },
  {
    id: 145,
    text: 'У нас нет твои книг.',
    targetWord: 'твои',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '2格，复数物主代词2格词尾 -их。',
    case: 2,
    gender: '复数'
  },
  {
    id: 146,
    text: 'Цвет твои роз красный.',
    targetWord: 'твои',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '2格，复数物主代词2格词尾 -их。',
    case: 2,
    gender: '复数'
  },
  {
    id: 147,
    text: 'Я иду к твои друзьям.',
    targetWord: 'твои',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'и', 'их', 'ими'],
    explanation: '3格，复数物主代词3格词尾 -им。',
    case: 3,
    gender: '复数'
  },
  {
    id: 148,
    text: 'По твои улицам едут машины.',
    targetWord: 'твои',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'и', 'их', 'ими'],
    explanation: '3格，复数物主代词3格词尾 -им。',
    case: 3,
    gender: '复数'
  },
  {
    id: 149,
    text: 'Я взял твои книги.',
    targetWord: 'твои',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '4格非动物，同1格，词尾 -и。',
    case: 4,
    gender: '复数'
  },
  {
    id: 150,
    text: 'Он ждёт твои друзей.',
    targetWord: 'твои',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '4格动物，同2格，词尾 -их。',
    case: 4,
    gender: '复数'
  },
  {
    id: 151,
    text: 'Я интересуюсь твои идеями.',
    targetWord: 'твои',
    originalEnding: '',
    correctEnding: 'ими',
    possibleEndings: ['ими', 'и', 'их', 'им'],
    explanation: '5格，复数物主代词5格词尾 -ими。',
    case: 5,
    gender: '复数'
  },
  {
    id: 152,
    text: 'Она любуется твои картинами.',
    targetWord: 'твои',
    originalEnding: '',
    correctEnding: 'ими',
    possibleEndings: ['ими', 'и', 'их', 'им'],
    explanation: '5格，复数物主代词5格词尾 -ими。',
    case: 5,
    gender: '复数'
  },
  {
    id: 153,
    text: 'Мы говорили о твои работах.',
    targetWord: 'твои',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '6格，复数物主代词6格词尾 -их。',
    case: 6,
    gender: '复数'
  },
  {
    id: 154,
    text: 'Он думает о твои друзьях.',
    targetWord: 'твои',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '6格，复数物主代词6格词尾 -их。',
    case: 6,
    gender: '复数'
  },
  {
    id: 155,
    text: 'Это наши друзья.',
    targetWord: 'наши',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '1格，复数物主代词1格词尾 -и。',
    case: 1,
    gender: '复数'
  },
  {
    id: 156,
    text: 'Наши окна открыты.',
    targetWord: 'Наши',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '1格，复数物主代词1格词尾 -и。',
    case: 1,
    gender: '复数'
  },
  {
    id: 157,
    text: 'У нас нет наши учителей.',
    targetWord: 'наши',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '2格，复数物主代词2格词尾 -их。',
    case: 2,
    gender: '复数'
  },
  {
    id: 158,
    text: 'Адрес наши школ известен.',
    targetWord: 'наши',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '2格，复数物主代词2格词尾 -их。',
    case: 2,
    gender: '复数'
  },
  {
    id: 159,
    text: 'Мы идём к наши друзьям.',
    targetWord: 'наши',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'и', 'их', 'ими'],
    explanation: '3格，复数物主代词3格词尾 -им。',
    case: 3,
    gender: '复数'
  },
  {
    id: 160,
    text: 'По наши улицам ходит автобус.',
    targetWord: 'наши',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'и', 'их', 'ими'],
    explanation: '3格，复数物主代词3格词尾 -им。',
    case: 3,
    gender: '复数'
  },
  {
    id: 161,
    text: 'Я люблю наши города.',
    targetWord: 'наши',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '4格非动物，同1格，词尾 -и。',
    case: 4,
    gender: '复数'
  },
  {
    id: 162,
    text: 'Мы пригласили наши соседей.',
    targetWord: 'наши',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '4格动物，同2格，词尾 -их。',
    case: 4,
    gender: '复数'
  },
  {
    id: 163,
    text: 'Мы гордимся наши победами.',
    targetWord: 'наши',
    originalEnding: '',
    correctEnding: 'ими',
    possibleEndings: ['ими', 'и', 'их', 'им'],
    explanation: '5格，复数物主代词5格词尾 -ими。',
    case: 5,
    gender: '复数'
  },
  {
    id: 164,
    text: 'Она довольна наши работами.',
    targetWord: 'наши',
    originalEnding: '',
    correctEnding: 'ими',
    possibleEndings: ['ими', 'и', 'их', 'им'],
    explanation: '5格，复数物主代词5格词尾 -ими。',
    case: 5,
    gender: '复数'
  },
  {
    id: 165,
    text: 'Мы говорили о наши поездках.',
    targetWord: 'наши',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '6格，复数物主代词6格词尾 -их。',
    case: 6,
    gender: '复数'
  },
  {
    id: 166,
    text: 'Он думает о наши семьях.',
    targetWord: 'наши',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '6格，复数物主代词6格词尾 -их。',
    case: 6,
    gender: '复数'
  },
  {
    id: 167,
    text: 'Это ваши друзья.',
    targetWord: 'ваши',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '1格，复数物主代词1格词尾 -и。',
    case: 1,
    gender: '复数'
  },
  {
    id: 168,
    text: 'Ваши письма пришли.',
    targetWord: 'Ваши',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '1格，复数物主代词1格词尾 -и。',
    case: 1,
    gender: '复数'
  },
  {
    id: 169,
    text: 'У меня нет ваши ключей.',
    targetWord: 'ваши',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '2格，复数物主代词2格词尾 -их。',
    case: 2,
    gender: '复数'
  },
  {
    id: 170,
    text: 'Цвет ваши машин синий.',
    targetWord: 'ваши',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '2格，复数物主代词2格词尾 -их。',
    case: 2,
    gender: '复数'
  },
  {
    id: 171,
    text: 'Я пойду к ваши друзьям.',
    targetWord: 'ваши',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'и', 'их', 'ими'],
    explanation: '3格，复数物主代词3格词尾 -им。',
    case: 3,
    gender: '复数'
  },
  {
    id: 172,
    text: 'По ваши улицам мы гуляли.',
    targetWord: 'ваши',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'и', 'их', 'ими'],
    explanation: '3格，复数物主代词3格词尾 -им。',
    case: 3,
    gender: '复数'
  },
  {
    id: 173,
    text: 'Я возьму ваши книги.',
    targetWord: 'ваши',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '4格非动物，同1格，词尾 -и。',
    case: 4,
    gender: '复数'
  },
  {
    id: 174,
    text: 'Мы ждём ваши детей.',
    targetWord: 'ваши',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '4格动物，同2格，词尾 -их。',
    case: 4,
    gender: '复数'
  },
  {
    id: 175,
    text: 'Я доволен ваши ответами.',
    targetWord: 'ваши',
    originalEnding: '',
    correctEnding: 'ими',
    possibleEndings: ['ими', 'и', 'их', 'им'],
    explanation: '5格，复数物主代词5格词尾 -ими。',
    case: 5,
    gender: '复数'
  },
  {
    id: 176,
    text: 'Он интересуется ваши идеями.',
    targetWord: 'ваши',
    originalEnding: '',
    correctEnding: 'ими',
    possibleEndings: ['ими', 'и', 'их', 'им'],
    explanation: '5格，复数物主代词5格词尾 -ими。',
    case: 5,
    gender: '复数'
  },
  {
    id: 177,
    text: 'Мы думаем о ваши работах.',
    targetWord: 'ваши',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '6格，复数物主代词6格词尾 -их。',
    case: 6,
    gender: '复数'
  },
  {
    id: 178,
    text: 'Они говорили о ваши семьях.',
    targetWord: 'ваши',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '6格，复数物主代词6格词尾 -их。',
    case: 6,
    gender: '复数'
  },
  {
    id: 179,
    text: 'У нас есть свои друзья.',
    targetWord: 'свои',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '1格，复数物主代词1格词尾 -и。',
    case: 1,
    gender: '复数'
  },
  {
    id: 180,
    text: 'У него нет свои книг.',
    targetWord: 'свои',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '2格，复数物主代词2格词尾 -их。',
    case: 2,
    gender: '复数'
  },
  {
    id: 181,
    text: 'Она любит свои детей.',
    targetWord: 'свои',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '4格动物，同2格，词尾 -их。',
    case: 4,
    gender: '复数'
  },
  {
    id: 182,
    text: 'Он гордится свои успехами.',
    targetWord: 'свои',
    originalEnding: '',
    correctEnding: 'ими',
    possibleEndings: ['ими', 'и', 'их', 'им'],
    explanation: '5格，复数物主代词5格词尾 -ими。',
    case: 5,
    gender: '复数'
  },
  {
    id: 183,
    text: 'Все люди знают это.',
    targetWord: 'Все',
    originalEnding: '',
    correctEnding: 'e',
    possibleEndings: ['e', 'ех', 'ем', 'еми'],
    explanation: '1格，复数物主代词1格词尾 -e。',
    case: 1,
    gender: '复数'
  },
  {
    id: 184,
    text: 'У меня нет все книг.',
    targetWord: 'все',
    originalEnding: '',
    correctEnding: 'ех',
    possibleEndings: ['ех', 'e', 'ем', 'еми'],
    explanation: '2格，复数物主代词2格词尾 -ех。',
    case: 2,
    gender: '复数'
  },
  {
    id: 185,
    text: 'Я вижу все дома.',
    targetWord: 'все',
    originalEnding: '',
    correctEnding: 'e',
    possibleEndings: ['e', 'ех', 'ем', 'еми'],
    explanation: '4格非动物，同1格，词尾 -e。',
    case: 4,
    gender: '复数'
  },
  {
    id: 186,
    text: 'Он доволен все результатами.',
    targetWord: 'все',
    originalEnding: '',
    correctEnding: 'еми',
    possibleEndings: ['еми', 'e', 'ех', 'ем'],
    explanation: '5格，复数物主代词5格词尾 -еми。',
    case: 5,
    gender: '复数'
  },
  {
    id: 187,
    text: 'Чьи это книги?',
    targetWord: 'Чьи',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '1格，复数物主代词1格词尾 -и。',
    case: 1,
    gender: '复数'
  },
  {
    id: 188,
    text: 'У тебя нет чьи книг?',
    targetWord: 'чьи',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '2格，复数物主代词2格词尾 -их。',
    case: 2,
    gender: '复数'
  },
  {
    id: 189,
    text: 'Я вижу чьи дома?',
    targetWord: 'чьи',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '4格非动物，同1格，词尾 -и。',
    case: 4,
    gender: '复数'
  },
  {
    id: 190,
    text: 'О чьи друзьях ты говоришь?',
    targetWord: 'чьи',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '6格，复数物主代词6格词尾 -их。',
    case: 6,
    gender: '复数'
  },
  {
    id: 191,
    text: 'Это наши новые дома.',
    targetWord: 'наши',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '1格，复数物主代词1格词尾 -и。',
    case: 1,
    gender: '复数'
  },
  {
    id: 192,
    text: 'Мы рады ваши успехам.',
    targetWord: 'ваши',
    originalEnding: '',
    correctEnding: 'им',
    possibleEndings: ['им', 'и', 'их', 'ими'],
    explanation: '3格，复数物主代词3格词尾 -им。',
    case: 3,
    gender: '复数'
  },
  {
    id: 193,
    text: 'Он взял свои тетради.',
    targetWord: 'свои',
    originalEnding: '',
    correctEnding: 'и',
    possibleEndings: ['и', 'их', 'им', 'ими'],
    explanation: '4格非动物，同1格，词尾 -и。',
    case: 4,
    gender: '复数'
  },
  {
    id: 194,
    text: 'Я думаю о твои родителях.',
    targetWord: 'твои',
    originalEnding: '',
    correctEnding: 'их',
    possibleEndings: ['их', 'и', 'им', 'ими'],
    explanation: '6格，复数物主代词6格词尾 -их。',
    case: 6,
    gender: '复数'
  },
  {
    id: 195,
    text: 'Все студенты здесь.',
    targetWord: 'Все',
    originalEnding: '',
    correctEnding: 'e',
    possibleEndings: ['e', 'ех', 'ем', 'еми'],
    explanation: '1格，复数物主代词1格词尾 -e。',
    case: 1,
    gender: '复数'
  }
])

// 当前形容词训练题目
const currentAdjectiveSentence = ref<{
  id: number
  text: string
  targetWord: string
  originalEnding: string
  correctEnding: string
  possibleEndings: string[]
  explanation: string
  case: number
  gender: string
} | null>(null)

// 形容词训练答题状态
const adjectiveSelectedEnding = ref<string>('')
const adjectiveShowDropdown = ref(false)
const adjectiveAnswerResult = ref<'correct' | 'incorrect' | null>(null)
const adjectiveShowResult = ref(false)
const usedAdjectiveSentences = ref<number[]>([]) // 记录已经出现过的题目ID

// 形容词训练下拉菜单位置
const adjectiveDropdownTop = ref(0)
const adjectiveDropdownLeft = ref(0)

// 物主代词训练状态（复用形容词训练的变量，但使用不同的数据源）
const usedPossessiveSentences = ref<number[]>([]) // 记录已经出现过的物主代词题目ID
const lastPossessiveWord = ref<string>('') // 记录上一个物主代词，用于避免连续出现

// 人称代词训练状态
const pronounTrainingState = ref('select-person') // select-person, practice
const selectedPerson = ref<string | null>(null) // 第一人称、第二人称、第三人称

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

// 移动端侧边栏状态
const mobileSidebarOpen = ref(false)

// 打开移动端侧边栏
const openMobileSidebar = () => {
  mobileSidebarOpen.value = true
}

// 关闭移动端侧边栏
const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false
}

// 从侧边栏导航
const navigateToFromSidebar = (page: string) => {
  closeMobileSidebar()
  navigateTo(page)
}
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



// 导航到指定页面
const navigateTo = (page: string, addToHistory: boolean = true) => {
  // 离开变格规则页面时保存滚动位置
  if (currentPage.value === 'declension-rules') {
    const isDesktop = window.innerWidth >= 768
    let scrollContainer: HTMLElement | null
    
    if (isDesktop) {
      // 桌面端使用.rules-content
      scrollContainer = document.querySelector('.rules-content') as HTMLElement
    } else {
      // 移动端使用.page-content
      scrollContainer = document.querySelector('.page-content.page-full-width') as HTMLElement
    }
    
    if (scrollContainer) {
      rulesScrollPosition.value = scrollContainer.scrollTop
    }
  }
  
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
  
  // 更新历史记录栈
  if (addToHistory && page !== currentPage.value) {
    // 如果不是在历史记录中间导航，则添加新记录
    if (historyIndex.value < navigationHistory.value.length - 1) {
      // 如果在历史记录中间，删除当前位置之后的记录
      navigationHistory.value = navigationHistory.value.slice(0, historyIndex.value + 1)
    }
    navigationHistory.value.push(page)
    historyIndex.value = navigationHistory.value.length - 1
    // 更新浏览器历史记录
    window.history.pushState({ page: page }, '', `#${page}`)
  }
  
  currentPage.value = page
  
  // 进入变格规则页面时恢复滚动位置
  if (page === 'declension-rules') {
    nextTick(() => {
      const isDesktop = window.innerWidth >= 768
      let scrollContainer: HTMLElement | null
      
      if (isDesktop) {
        // 桌面端使用.rules-content
        scrollContainer = document.querySelector('.rules-content') as HTMLElement
      } else {
        // 移动端使用.page-content
        scrollContainer = document.querySelector('.page-content.page-full-width') as HTMLElement
      }
      
      if (scrollContainer) {
        scrollContainer.scrollTop = rulesScrollPosition.value
      }
    })
  }
  
  if (page === 'case-training') {
    // 只有在从主页进入时才重置状态
    if (previousPage.value === 'home') {
      caseTrainingState.value = 'select-case'
      selectedCase.value = null
      resetPracticeState()
    }
  } else if (page === 'adj-training' || page === 'poss-training') {
    // 形容词训练或物主代词训练
    adjPossTrainingState.value = 'select-gender'
    selectedGender.value = null
    currentAdjPossType.value = page === 'adj-training' ? 'adjective' : 'possessive'
    resetPracticeState()
  } else if (page === 'pronoun-training') {
    // 人称代词训练
    pronounTrainingState.value = 'select-person'
    selectedPerson.value = null
    resetPracticeState()
  } else if (page === 'adj-noun-combined') {
    // 形容词+名词组合训练
    adjNounCombinedState.value = 'practice'
    loadAdjNounCombinedSentence()
  } else if (page === 'poss-noun-combined') {
    // 物主代词+名词组合训练
    possNounCombinedState.value = 'practice'
    loadPossNounCombinedSentence()
  } else if (page === 'num-noun-combined') {
    // 数词+名词组合训练
    numNounCombinedState.value = 'practice'
    loadNumNounCombinedSentence()
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

// 测试题目池
const testQuestionPool = [
  { text: 'Вчера я купил хорошая книга в подарок другу.', targetWord: 'хорошая книга', correctAnswer: 'хорошую книгу', explanation: '动词 купить 要求第四格。', number: '单数' },
  { text: 'Дети радуются белый снег зимой.', targetWord: 'белый снег', correctAnswer: 'белому снегу', explanation: '动词 радоваться 要求第三格。', number: '单数' },
  { text: 'Мы любовались красивый город вечером.', targetWord: 'красивый город', correctAnswer: 'красивым городом', explanation: '动词 любоваться 要求第五格。', number: '单数' },
  { text: 'На столе не было свежий хлеб.', targetWord: 'свежий хлеб', correctAnswer: 'свежего хлеба', explanation: '否定结构"не было"要求第二格。', number: '单数' },
  { text: 'Они встретились у старый парк.', targetWord: 'старый парк', correctAnswer: 'старого парка', explanation: '前置词 у 要求第二格。', number: '单数' },
  { text: 'Мама сварила компот из спелое яблоко.', targetWord: 'спелое яблоко', correctAnswer: 'спелого яблока', explanation: '前置词 из 要求第二格。', number: '单数' },
  { text: 'Студенты говорили о новый фильм.', targetWord: 'новый фильм', correctAnswer: 'новых фильмах', explanation: '前置词 о 要求第六格，复数。', number: '复数' },
  { text: 'В зоопарке дети видели интересное животное.', targetWord: 'интересное животное', correctAnswer: 'интересных животных', explanation: '动词 видели 要求第四格，动物名词复数第四格同第二格。', number: '复数' },
  { text: 'Для маленький ребенок эта игра не подходит.', targetWord: 'маленький ребенок', correctAnswer: 'маленьких детей', explanation: '前置词 для 要求第二格，复数。', number: '复数' },
  { text: 'Экскурсовод рассказывал о старинное здание.', targetWord: 'старинное здание', correctAnswer: 'старинных зданиях', explanation: '前置词 о 要求第六格，复数。', number: '复数' },
  { text: 'Я мечтаю о большая квартира в центре.', targetWord: 'большая квартира', correctAnswer: 'большой квартире', explanation: '动词 мечтать о 要求第六格。', number: '单数' },
  { text: 'Спортсмены гордились золотая медаль.', targetWord: 'золотая медаль', correctAnswer: 'золотыми медалями', explanation: '动词 гордились 要求第五格，复数。', number: '复数' },
  { text: 'В библиотеке нет учебника по русский язык.', targetWord: 'русский язык', correctAnswer: 'русскому языку', explanation: '前置词 по 表示学科时要求第三格。', number: '单数' },
  { text: 'Мы шли по широкая улица.', targetWord: 'широкая улица', correctAnswer: 'широкой улице', explanation: '前置词 по 表示"沿着"时要求第三格。', number: '单数' },
  { text: 'Художник рисовал портрет молодая женщина.', targetWord: 'молодая женщина', correctAnswer: 'молодой женщины', explanation: '名词 портрет 后接第二格表示对象。', number: '单数' },
  { text: 'Кошка играла с маленький мяч.', targetWord: 'маленький мяч', correctAnswer: 'маленьким мячом', explanation: '前置词 с 表示工具时要求第五格。', number: '单数' },
  { text: 'В тексте были ошибки в длинное предложение.', targetWord: 'длинное предложение', correctAnswer: 'длинных предложениях', explanation: '前置词 в 表示范围时要求第六格，复数。', number: '复数' },
  { text: 'Друзья купили билеты на интересный спектакль.', targetWord: 'интересный спектакль', correctAnswer: 'интересный спектакль', explanation: '前置词 на 表示方向时要求第四格。', number: '单数' },
  { text: 'На выставке показаны работы известный художник.', targetWord: 'известный художник', correctAnswer: 'известных художников', explanation: '名词 работы 后接第二格表示所属，复数。', number: '复数' },
  { text: 'Пассажиры ждали скорый поезд.', targetWord: 'скорый поезд', correctAnswer: 'скорого поезда', explanation: '动词 ждали 要求第二格（表示期望的事物）。', number: '单数' },
  { text: 'Мы говорили о летние каникулы.', targetWord: 'летние каникулы', correctAnswer: 'летних каникулах', explanation: '前置词 о 要求第六格，复数。', number: '复数' },
  { text: 'Врач выписал лекарство от сильный кашель.', targetWord: 'сильный кашель', correctAnswer: 'сильного кашля', explanation: '前置词 от 表示原因时要求第二格。', number: '单数' },
  { text: 'Девочка угостила подругу вкусная конфета.', targetWord: 'вкусная конфета', correctAnswer: 'вкусной конфетой', explanation: '动词 угостила 要求第五格。', number: '单数' },
  { text: 'В статье писали о важная проблема.', targetWord: 'важная проблема', correctAnswer: 'важных проблемах', explanation: '前置词 о 要求第六格，复数。', number: '复数' },
  { text: 'Студенты сдали экзамен по трудный предмет.', targetWord: 'трудный предмет', correctAnswer: 'трудному предмету', explanation: '前置词 по 表示学科时要求第三格。', number: '单数' },
  { text: 'Рыбаки вернулись с хороший улов.', targetWord: 'хороший улов', correctAnswer: 'хорошим уловом', explanation: '前置词 с 表示伴随时要求第五格。', number: '单数' },
  { text: 'Для горячий чай нужен сахар.', targetWord: 'горячий чай', correctAnswer: 'горячего чая', explanation: '前置词 для 表示用途时要求第二格。', number: '单数' },
  { text: 'Туристы смотрели на красивый закат.', targetWord: 'красивый закат', correctAnswer: 'красивый закат', explanation: '动词 смотрели на 要求第四格。', number: '单数' },
  { text: 'В музее есть картины великий художник.', targetWord: 'великий художник', correctAnswer: 'великих художников', explanation: '名词 картины 后接第二格表示作者，复数。', number: '复数' },
  { text: 'Ребёнок боится громкий звук.', targetWord: 'громкий звук', correctAnswer: 'громких звуков', explanation: '动词 боится 要求第二格，复数。', number: '复数' },
  { text: 'Комнату украсили воздушный шар.', targetWord: 'воздушный шар', correctAnswer: 'воздушными шарами', explanation: '动词 украсили 表示用某物装饰时要求第五格，复数。', number: '复数' },
  { text: 'В расписании нет изменений в вечернее занятие.', targetWord: 'вечернее занятие', correctAnswer: 'вечерних занятиях', explanation: '前置词 в 表示范围时要求第六格，复数。', number: '复数' },
  { text: 'Я потерял ключ от входная дверь.', targetWord: 'входная дверь', correctAnswer: 'входной двери', explanation: '前置词 от 表示来源时要求第二格。', number: '单数' },
  { text: 'Они остановились у горная река.', targetWord: 'горная река', correctAnswer: 'горной реки', explanation: '前置词 у 要求第二格。', number: '单数' },
  { text: 'Бабушка испекла пирог с яблочное варенье.', targetWord: 'яблочное варенье', correctAnswer: 'яблочным вареньем', explanation: '前置词 с 表示内容时要求第五格。', number: '单数' },
  { text: 'На собрании наградили лучший работник.', targetWord: 'лучший работник', correctAnswer: 'лучших работников', explanation: '动词 наградили 要求第四格，动物名词复数第四格同第二格。', number: '复数' },
  { text: 'В саду посадили красивый цветок.', targetWord: 'красивый цветок', correctAnswer: 'красивые цветы', explanation: '动词 посадили 要求第四格，非动物名词复数第四格同第一格。', number: '复数' },
  { text: 'Фильм снят по роману известный писатель.', targetWord: 'известный писатель', correctAnswer: 'известного писателя', explanation: '名词 роману 后接第二格表示作者（по роману известного писателя）。', number: '单数' },
  { text: 'Собака бежала за почтовая машина.', targetWord: 'почтовая машина', correctAnswer: 'почтовой машиной', explanation: '前置词 за 表示"跟随"时要求第五格。', number: '单数' },
  { text: 'Ученики писали сочинение по прочитанный рассказ.', targetWord: 'прочитанный рассказ', correctAnswer: 'прочитанным рассказам', explanation: '前置词 по 表示依据时要求第三格，复数。', number: '复数' },
  { text: 'Мы готовились к трудный экзамен.', targetWord: 'трудный экзамен', correctAnswer: 'трудному экзамену', explanation: '前置词 к 表示准备时要求第三格。', number: '单数' },
  { text: 'В корзине лежало много спелая груша.', targetWord: 'спелая груша', correctAnswer: 'спелых груш', explanation: 'много 后接名词复数第二格。', number: '复数' },
  { text: 'Друзья обменялись электронное письмо.', targetWord: 'электронное письмо', correctAnswer: 'электронными письмами', explanation: '动词 обменялись 要求第五格，复数。', number: '复数' },
  { text: 'На уроке говорили о геометрическая фигура.', targetWord: 'геометрическая фигура', correctAnswer: 'геометрических фигурах', explanation: '前置词 о 要求第六格，复数。', number: '复数' },
  { text: 'Я горжусь лучший друг.', targetWord: 'лучший друг', correctAnswer: 'лучшим другом', explanation: '动词 горжусь 要求第五格。', number: '单数' },
  { text: 'В магазине большой выбор тёплая куртка.', targetWord: 'тёплая куртка', correctAnswer: 'тёплых курток', explanation: '名词 выбор 后接第二格，复数。', number: '复数' },
  { text: 'Дети бежали по зелёная трава после дождя.', targetWord: 'зелёная трава', correctAnswer: 'зелёной траве', explanation: '前置词 по 表示表面移动时要求第三格。', number: '单数' },
  { text: 'В книге описана жизнь простой крестьянин.', targetWord: 'простой крестьянин', correctAnswer: 'простого крестьянина', explanation: '名词 жизнь 后接第二格表示"谁的生活"。', number: '单数' },
  { text: 'Мы смотрели на полёт дикий гусь.', targetWord: 'дикий гусь', correctAnswer: 'диких гусей', explanation: '名词 полёт 后接第二格表示主体，复数。', number: '复数' },
  { text: 'К новогодний ужин подали торт.', targetWord: 'новогодний ужин', correctAnswer: 'новогоднему ужину', explanation: '前置词 к 表示方向时要求第三格。', number: '单数' },
  { text: 'Фильм снят по роману популярный автор.', targetWord: 'популярный автор', correctAnswer: 'популярного автора', explanation: '名词 роману 后接第二格表示作者（по роману популярного автора）。', number: '单数' },
  { text: 'Собака бежала за хозяйский велосипед.', targetWord: 'хозяйский велосипед', correctAnswer: 'хозяйским велосипедом', explanation: '前置词 за 表示"跟随"时要求第五格。', number: '单数' },
  { text: 'Ученики писали сочинение по изученное произведение.', targetWord: 'изученное произведение', correctAnswer: 'изученным произведениям', explanation: '前置词 по 表示依据时要求第三格，复数。', number: '复数' },
  { text: 'Мы готовились к ответственный зачёт.', targetWord: 'ответственный зачёт', correctAnswer: 'ответственному зачёту', explanation: '前置词 к 表示准备时要求第三格。', number: '单数' },
  { text: 'В корзине лежало много красный помидор.', targetWord: 'красный помидор', correctAnswer: 'красных помидоров', explanation: 'много 后接名词复数第二格。', number: '复数' },
  { text: 'Друзья обменялись поздравительная открытка.', targetWord: 'поздравительная открытка', correctAnswer: 'поздравительными открытками', explanation: '动词 обменялись 要求第五格，复数。', number: '复数' },
  { text: 'На уроке говорили о геометрическая фигура.', targetWord: 'геометрическая фигура', correctAnswer: 'геометрических фигурах', explanation: '前置词 о 要求第六格，复数。', number: '复数' },
  // 新增50道物主代词+名词题目
  { text: 'Сестра взяла мой карандаш без спроса.', targetWord: 'мой карандаш', correctAnswer: 'мой карандаш', explanation: 'взять + 4格', number: '单数' },
  { text: 'Мы обрадовались твой подарок на день рождения.', targetWord: 'твой подарок', correctAnswer: 'твоему подарку', explanation: 'обрадоваться + 3格', number: '单数' },
  { text: 'Он гордится наш успех в учёбе.', targetWord: 'наш успех', correctAnswer: 'нашим успехом', explanation: 'гордиться + 5格', number: '单数' },
  { text: 'В комнате не было ваш стул, пришлось стоять.', targetWord: 'ваш стул', correctAnswer: 'вашего стула', explanation: 'не было + 2格', number: '单数' },
  { text: 'Они подошли к свой дом после прогулки.', targetWord: 'свой дом', correctAnswer: 'своему дому', explanation: 'к + 3格', number: '单数' },
  { text: 'Мама купила моя юбка вчера в магазине.', targetWord: 'моя юбка', correctAnswer: 'мою юбку', explanation: 'купить + 4格', number: '单数' },
  { text: 'Дети рады твоя помощь с уроками.', targetWord: 'твоя помощь', correctAnswer: 'твоей помощи', explanation: 'рады + 3格', number: '单数' },
  { text: 'Мы любовались наша река с высокого берега.', targetWord: 'наша река', correctAnswer: 'нашей рекой', explanation: 'любоваться + 5格', number: '单数' },
  { text: 'Она ждала ваша машина у подъезда.', targetWord: 'ваша машина', correctAnswer: 'вашу машину', explanation: 'ждать + 4格', number: '单数' },
  { text: 'Я думаю о своя работа каждый вечер.', targetWord: 'своя работа', correctAnswer: 'своей работе', explanation: 'думать о + 6格', number: '单数' },
  { text: 'Друзья говорили о мой план на лето.', targetWord: 'мой план', correctAnswer: 'моих планах', explanation: 'говорить о + 6格', number: '复数' },
  { text: 'На столе лежали твоя тетрадь по математике.', targetWord: 'твоя тетрадь', correctAnswer: 'твои тетради', explanation: '主语，1格', number: '复数' },
  { text: 'Он интересовался наше предложение по проекту.', targetWord: 'наше предложение', correctAnswer: 'нашими предложениями', explanation: 'интересоваться + 5格', number: '复数' },
  { text: 'Мы готовы к ваш вопрос после доклада.', targetWord: 'ваш вопрос', correctAnswer: 'вашим вопросам', explanation: 'готовы к + 3格', number: '复数' },
  { text: 'Они заботились о свой ребёнок во время каникул.', targetWord: 'свой ребёнок', correctAnswer: 'своих детях', explanation: 'заботиться о + 6格', number: '复数' },
  { text: 'Учитель проверил моя контрольная работа и похвалил.', targetWord: 'моя контрольная работа', correctAnswer: 'мою контрольную работу', explanation: 'проверить + 4格', number: '单数' },
  { text: 'Мы радовались твоё здоровье после болезни.', targetWord: 'твоё здоровье', correctAnswer: 'твоему здоровью', explanation: 'радоваться + 3格', number: '单数' },
  { text: 'Он рассказал о наше путешествие в горы.', targetWord: 'наше путешествие', correctAnswer: 'нашем путешествии', explanation: 'рассказать о + 6格', number: '单数' },
  { text: 'Я встретился с ваш брат в кафе.', targetWord: 'ваш брат', correctAnswer: 'вашим братом', explanation: 'встретиться с + 5格', number: '单数' },
  { text: 'Она думала о своё будущее с оптимизмом.', targetWord: 'своё будущее', correctAnswer: 'своём будущем', explanation: 'думать о + 6格', number: '单数' },
  { text: 'В парке гуляли мой друг с собаками.', targetWord: 'мой друг', correctAnswer: 'мои друзья', explanation: '主语，1格', number: '复数' },
  { text: 'На полке стояли твоя книга по истории.', targetWord: 'твоя книга', correctAnswer: 'твои книги', explanation: '主语，1格', number: '复数' },
  { text: 'Это подарки для наш гость из другого города.', targetWord: 'наш гость', correctAnswer: 'наших гостей', explanation: 'для + 2格', number: '复数' },
  { text: 'Он забыл про ваше обещание помочь нам.', targetWord: 'ваше обещание', correctAnswer: 'ваши обещания', explanation: 'забыть про + 4格', number: '复数' },
  { text: 'Мы встретили свой знакомый в театре.', targetWord: 'свой знакомый', correctAnswer: 'своих знакомых', explanation: 'встретить + 4格（动物名词）', number: '复数' },
  { text: 'Я купил мой телефон в прошлом месяце.', targetWord: 'мой телефон', correctAnswer: 'мой телефон', explanation: 'купить + 4格', number: '单数' },
  { text: 'Дети радуются твой приезд к бабушке.', targetWord: 'твой приезд', correctAnswer: 'твоему приезду', explanation: 'радоваться + 3格', number: '单数' },
  { text: 'Она восхищалась наш город ночью.', targetWord: 'наш город', correctAnswer: 'нашим городом', explanation: 'восхищаться + 5格', number: '单数' },
  { text: 'Мы ждали ваш ответ на письмо.', targetWord: 'ваш ответ', correctAnswer: 'ваш ответ', explanation: 'ждать + 4格', number: '单数' },
  { text: 'Он мечтал о своя машина красного цвета.', targetWord: 'своя машина', correctAnswer: 'свой машине', explanation: 'мечтать о + 6格', number: '单数' },
  { text: 'Студенты сдали мой учебник в библиотеку после экзамена.', targetWord: 'мой учебник', correctAnswer: 'мои учебники', explanation: 'сдать + 4格', number: '复数' },
  { text: 'Мы говорили о твой успех в спорте.', targetWord: 'твой успех', correctAnswer: 'твоих успехах', explanation: 'говорить о + 6格', number: '复数' },
  { text: 'Он заботится о наш родитель каждый день.', targetWord: 'наш родитель', correctAnswer: 'наших родителях', explanation: 'заботиться о + 6格', number: '复数' },
  { text: 'Они не знали про ваш план уехать.', targetWord: 'ваш план', correctAnswer: 'ваши планы', explanation: 'не знать про + 4格', number: '复数' },
  { text: 'Мы познакомились с свой сосед на лестнице.', targetWord: 'свой сосед', correctAnswer: 'своими соседями', explanation: 'познакомиться с + 5格', number: '复数' },
  { text: 'Сестра потеряла моя серёжка в школе.', targetWord: 'моя серёжка', correctAnswer: 'мою серёжку', explanation: 'потерять + 4格', number: '单数' },
  { text: 'Мы обрадовались твоё письмо из далёкой страны.', targetWord: 'твоё письмо', correctAnswer: 'твоему письму', explanation: 'обрадоваться + 3格', number: '单数' },
  { text: 'Он доволен наш результат на соревнованиях.', targetWord: 'наш результат', correctAnswer: 'нашим результатом', explanation: 'доволен + 5格', number: '单数' },
  { text: 'Я пойду к ваш врач на приём завтра.', targetWord: 'ваш врач', correctAnswer: 'вашему врачу', explanation: 'пойти к + 3格', number: '单数' },
  { text: 'Она мечтала о своя дача возле леса.', targetWord: 'своя дача', correctAnswer: 'свой даче', explanation: 'мечтать о + 6格', number: '单数' },
  { text: 'На выставке представили мой рисунок акварелью.', targetWord: 'мой рисунок', correctAnswer: 'мои рисунки', explanation: 'представить + 4格', number: '复数' },
  { text: 'Он вспоминал о твой совет в трудную минуту.', targetWord: 'твой совет', correctAnswer: 'твоих советах', explanation: 'вспоминать о + 6格', number: '复数' },
  { text: 'Мы благодарны наш учитель за знания.', targetWord: 'наш учитель', correctAnswer: 'нашим учителям', explanation: 'благодарны + 3格', number: '复数' },
  { text: 'Они ответили на ваше письмо электронной почтой.', targetWord: 'ваше письмо', correctAnswer: 'ваши письма', explanation: 'ответить на + 4格', number: '复数' },
  { text: 'Мы встретились с свой родственник на вокзале.', targetWord: 'свой родственник', correctAnswer: 'своими родственниками', explanation: 'встретиться с + 5格', number: '复数' },
  { text: 'Я взял мой рюкзак с собой в поход.', targetWord: 'мой рюкзак', correctAnswer: 'мой рюкзак', explanation: 'взять + 4格', number: '单数' },
  { text: 'Он рад твой звонок после долгой разлуки.', targetWord: 'твой звонок', correctAnswer: 'твоему звонку', explanation: 'рад + 3格', number: '单数' },
  { text: 'Мы гордимся наша школа и её традициями.', targetWord: 'наша школа', correctAnswer: 'нашей школой', explanation: 'гордиться + 5格', number: '单数' },
  { text: 'Она пошла к ваша подруга за книгой.', targetWord: 'ваша подруга', correctAnswer: 'вашей подруге', explanation: 'пойти к + 3格', number: '单数' },
  { text: 'Дети играли с своя игрушка в песочнице.', targetWord: 'своя игрушка', correctAnswer: 'своими игрушками', explanation: 'играть с + 5格', number: '复数' }
]

// 跟踪已使用的题目索引
const usedQuestionIndices = ref<Set<number>>(new Set())

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

// 生成测试题目
const generateTestQuestions = () => {
  const pool = [...testQuestionPool]
  
  // 生成所有索引
  const allIndices = pool.map((_, idx) => idx)
  
  // 过滤出未使用的索引
  const unusedIndices = allIndices.filter(idx => !usedQuestionIndices.value.has(idx))
  
  // 如果剩余可用题目不足15道，重置已使用列表
  if (unusedIndices.length < 15) {
    usedQuestionIndices.value.clear()
  }
  
  // 再次获取未使用的索引（可能已重置）
  const availableIndices = allIndices.filter(idx => !usedQuestionIndices.value.has(idx))
  
  // 打乱可用索引
  const shuffledAvailable = shuffle(availableIndices)
  
  // 选择15道题目
  const selectedIndices = shuffledAvailable.slice(0, 15) as number[]
  
  // 将选中的索引添加到已使用集合
  selectedIndices.forEach(idx => usedQuestionIndices.value.add(idx))
  
  // 根据选中的索引获取题目
  const selected = selectedIndices
    .map(idx => pool[idx])
    .filter((s): s is typeof pool[0] => s !== undefined)
  
  return selected.map((sentence, index) => {
    const targetWord = sentence.targetWord
    const correctAnswer = sentence.correctAnswer
    
    // 分离形容词和名词
    const words = targetWord.split(' ')
    const adjective = words[0]
    const noun = words[1]
    
    // 处理文本，高亮形容词和名词
    let processedText = sentence.text
    processedText = processedText.replace(/<[^>]*>/g, '')
    
    // 高亮形容词（蓝色）和名词（红色）
    const targetIndex = processedText.indexOf(targetWord)
    if (targetIndex !== -1) {
      const before = processedText.slice(0, targetIndex)
      const after = processedText.slice(targetIndex + targetWord.length)
      processedText = before + `<span style="color: #3498db;">${adjective}</span> <span style="color: #e74c3c;">${noun}</span>` + after
    }
    
    // 生成选项（基于正确答案）
    const options = [correctAnswer]
    
    // 生成干扰选项
    const correctWords = correctAnswer.split(' ')
    
    // 处理包含多个词的情况（如形容词+多个名词）
    const correctAdj = correctWords[0] || ''
    const correctNoun = correctWords.slice(1).join(' ') || ''
    
    if (!correctAdj || !correctNoun) {
      return {
        id: index + 1,
        text: processedText,
        targetWord: sentence.targetWord,
        options: [correctAnswer],
        correctAnswer: 0,
        explanation: sentence.explanation,
        number: sentence.number
      }
    }
    
    // 物主代词变格表（按性和数分类）
    const possessivePronouns = {
      'мой': {
        masculine: ['мой', 'моего', 'моему', 'мой', 'моим', 'моем'],
        feminine: ['моя', 'моей', 'мою'],
        neuter: ['моё', 'моего', 'моему', 'моё', 'моим', 'моем'],
        plural: ['мои', 'моих', 'моим', 'мои', 'моими', 'моих']
      },
      'твой': {
        masculine: ['твой', 'твоего', 'твоему', 'твой', 'твоим', 'твоем'],
        feminine: ['твоя', 'твоей', 'твою'],
        neuter: ['твоё', 'твоего', 'твоему', 'твоё', 'твоим', 'твоем'],
        plural: ['твои', 'твоих', 'твоим', 'твои', 'твоими', 'твоих']
      },
      'наш': {
        masculine: ['наш', 'нашего', 'нашему', 'наш', 'нашим', 'нашем'],
        feminine: ['наша', 'нашей', 'нашу'],
        neuter: ['наше', 'нашего', 'нашему', 'наше', 'нашим', 'нашем'],
        plural: ['наши', 'наших', 'нашим', 'наши', 'нашими', 'наших']
      },
      'ваш': {
        masculine: ['ваш', 'вашего', 'вашему', 'ваш', 'вашим', 'вашем'],
        feminine: ['ваша', 'вашей', 'вашу'],
        neuter: ['ваше', 'вашего', 'вашему', 'ваше', 'вашим', 'вашем'],
        plural: ['ваши', 'ваших', 'вашим', 'ваши', 'вашими', 'ваших']
      },
      'свой': {
        masculine: ['свой', 'своего', 'своему', 'свой', 'своим', 'своём'],
        feminine: ['своя', 'своей', 'свою'],
        neuter: ['своё', 'своего', 'своему', 'своё', 'своим', 'своём'],
        plural: ['свои', 'своих', 'своим', 'свои', 'своими', 'своих']
      }
    }
    
    // 物主代词所有形式的映射，用于检测
    const allPossessiveForms = new Map<string, { base: string; gender: string }>()
    Object.entries(possessivePronouns).forEach(([base, forms]) => {
      Object.entries(forms).forEach(([gender, variants]) => {
        variants.forEach(variant => {
          allPossessiveForms.set(variant, { base, gender })
        })
      })
    })
    
    // 检查是否是物主代词
    const firstWord = words[0]
    const possessiveInfo = typeof firstWord === 'string' ? allPossessiveForms.get(firstWord) : null
    const isPossessivePronoun = !!possessiveInfo
    
    // 确定形容词/物主代词的性和数
    let gender = 'masculine' // 默认阳性
    
    // 优先使用题目中指定的数
    if (sentence.number === '复数') {
      gender = 'plural'
    } else if (isPossessivePronoun && possessiveInfo) {
      gender = possessiveInfo.gender
    } else {
      // 分析形容词的性和数
      if (correctAdj.endsWith('ая') || correctAdj.endsWith('ой') || correctAdj.endsWith('ую')) {
        gender = 'feminine'
      } else if (correctAdj.endsWith('ое') || correctAdj.endsWith('ем') || correctAdj.endsWith('ому')) {
        gender = 'neuter'
      } else if (correctAdj.endsWith('ые') || correctAdj.endsWith('ых') || correctAdj.endsWith('ыми')) {
        gender = 'plural'
      }
    }
    
    // 提取词干
    const adjStem = correctAdj.replace(/(ый|ой|ий|ая|ое|ые|ого|его|ому|ему|ым|им|ую|ою|ых|их|ыми|ими)$/, '')
    const nounStem = correctNoun.replace(/(а|я|о|е|ы|и|у|ю|ой|ей|ов|ев|ам|ям|ами|ями|ах|ях)$/, '')
    
    // 判断是否为软变化形容词（以-ий结尾，但排除以-ский结尾的硬变化形容词）
    const isSoftAdjective = (correctAdj.endsWith('ий') && !correctAdj.endsWith('ский')) || 
                            (correctAdj.endsWith('его') && !correctAdj.endsWith('ского')) || 
                            (correctAdj.endsWith('ему') && !correctAdj.endsWith('скому')) || 
                            (correctAdj.endsWith('им') && !correctAdj.endsWith('ским')) || 
                            (correctAdj.endsWith('ем') && !correctAdj.endsWith('ском')) || 
                            correctAdj.endsWith('ие') || 
                            correctAdj.endsWith('их') || 
                            correctAdj.endsWith('ими')
    
    // 生成不同的形容词/物主代词变格（保持性和数一致）
    let adjVariants: string[] = []
    if (isPossessivePronoun && possessiveInfo) {
      // 使用物主代词的正确变格（保持性和数一致）
      const baseForm = possessiveInfo.base as keyof typeof possessivePronouns
      adjVariants = (possessivePronouns[baseForm][gender as keyof typeof possessivePronouns[typeof baseForm]] || [])
        .filter(pronoun => pronoun !== correctAdj)
    } else {
      // 普通形容词变格（保持性和数一致）
      if (isSoftAdjective) {
        // 软变化形容词（如：красивый → красивого, синий → синего）
        const softStem = adjStem
        if (gender === 'feminine') {
          adjVariants = [
            correctAdj,
            softStem + 'яя',
            softStem + 'ей',
            softStem + 'юю'
          ].filter(adj => adj !== correctAdj)
        } else if (gender === 'neuter') {
          adjVariants = [
            correctAdj,
            softStem + 'ее',
            softStem + 'его',
            softStem + 'ему',
            softStem + 'им',
            softStem + 'ем'
          ].filter(adj => adj !== correctAdj)
        } else if (gender === 'plural') {
          adjVariants = [
            correctAdj,
            softStem + 'ие',
            softStem + 'их',
            softStem + 'ими'
          ].filter(adj => adj !== correctAdj)
        } else { // masculine
          adjVariants = [
            correctAdj,
            softStem + 'ий',
            softStem + 'его',
            softStem + 'ему',
            softStem + 'им',
            softStem + 'ем'
          ].filter(adj => adj !== correctAdj)
        }
      } else {
        // 硬变化形容词
        if (gender === 'feminine') {
          adjVariants = [
            correctAdj,
            adjStem + 'ая',
            adjStem + 'ой',
            adjStem + 'ую'
          ].filter(adj => adj !== correctAdj)
        } else if (gender === 'neuter') {
          adjVariants = [
            correctAdj,
            adjStem + 'ое',
            adjStem + 'ого',
            adjStem + 'ому',
            adjStem + 'ым',
            adjStem + 'ом'
          ].filter(adj => adj !== correctAdj)
        } else if (gender === 'plural') {
          adjVariants = [
            correctAdj,
            adjStem + 'ые',
            adjStem + 'ых',
            adjStem + 'ыми'
          ].filter(adj => adj !== correctAdj)
        } else { // masculine
          // 判断原始形容词是否以-ский结尾，如果是则使用-ий而非-ый
          const isSkiyAdjective = correctAdj.includes('ск') && (correctAdj.endsWith('ий') || correctAdj.endsWith('ого') || correctAdj.endsWith('ому') || correctAdj.endsWith('им') || correctAdj.endsWith('ом'))
          adjVariants = [
            correctAdj,
            isSkiyAdjective ? adjStem + 'ий' : adjStem + 'ый',
            adjStem + 'ого',
            adjStem + 'ому',
            adjStem + 'ым',
            adjStem + 'ом'
          ].filter(adj => adj !== correctAdj)
        }
      }
    }
    
    // 生成不同的名词变格
    const nounVariants = [
      correctNoun,
      nounStem + 'а',
      nounStem + 'я',
      nounStem + 'у',
      nounStem + 'ю',
      nounStem + 'ом',
      nounStem + 'ем',
      nounStem + 'ой',
      nounStem + 'ей',
      nounStem + 'ов',
      nounStem + 'ев',
      nounStem + 'ам',
      nounStem + 'ям',
      nounStem + 'ами',
      nounStem + 'ями',
      nounStem + 'ах',
      nounStem + 'ях'
    ].filter(noun => noun !== correctNoun)
    
    // 组合生成干扰选项
    for (let i = 0; i < 3 && i < adjVariants.length; i++) {
      options.push(adjVariants[i] + ' ' + correctNoun)
    }
    for (let i = 0; i < 3 && i < nounVariants.length; i++) {
      options.push(correctAdj + ' ' + nounVariants[i])
    }
    
    // 去重
    const uniqueOptions = [...new Set(options)].slice(0, 4)
    
    // 打乱选项顺序
    const shuffledOptions = [...uniqueOptions]
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = shuffledOptions[i]
      shuffledOptions[i] = shuffledOptions[j] as string
      shuffledOptions[j] = temp as string
    }
    
    // 找到正确答案的索引
    const correctAnswerIndex = shuffledOptions.indexOf(correctAnswer)
    
    return {
      id: index + 1,
      text: processedText,
      targetWord: sentence.targetWord,
      options: shuffledOptions,
      correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
      explanation: sentence.explanation,
      number: sentence.number
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
    const answer = userAnswers.value[currentQuestionIndex.value]
    selectedAnswer.value = answer !== undefined && answer !== -1 ? answer : -1
    testShowResult.value = false
  }
}

// 上一题
const testPrevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    const answer = userAnswers.value[currentQuestionIndex.value]
    selectedAnswer.value = answer !== undefined && answer !== -1 ? answer : -1
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

// 变格规则页面分类类型
type RulesCategory = 'noun' | 'adjective' | 'personal-pronoun' | 'possessive-pronoun' | 'numeral' | 'other'

// 变格规则页面当前选中的分类
const selectedRulesCategory = ref<RulesCategory>('noun')

// 变格规则页面滚动位置
const rulesScrollPosition = ref(0)

// 变格规则页面分类导航栏ref
const categoryScroll = ref<HTMLElement | null>(null)
const categoryBtnRefs = ref<Record<string, HTMLElement>>({})

// 设置分类按钮ref
const setCategoryBtnRef = (id: string, el: any) => {
  if (el) {
    categoryBtnRefs.value[id] = el
  }
}

// 切换变格规则页面分类
const selectRulesCategory = (category: RulesCategory) => {
  selectedRulesCategory.value = category
  // 切换分类时重置所有折叠状态
  Object.keys(expandedCases).forEach(key => {
    expandedCases[Number(key)] = false
  })
  selectedDesktopCase.value = null
  
  // 自动滚动导航栏，使当前分类按钮可见
  nextTick(() => {
    const btn = categoryBtnRefs.value[category]
    const scrollContainer = categoryScroll.value
    if (btn && scrollContainer) {
      const btnLeft = btn.offsetLeft
      const btnWidth = btn.offsetWidth
      const scrollWidth = scrollContainer.scrollWidth
      const containerWidth = scrollContainer.offsetWidth
      
      // 计算使按钮居中的滚动位置
      let scrollPos = btnLeft - (containerWidth / 2) + (btnWidth / 2)
      
      // 边界检查
      scrollPos = Math.max(0, Math.min(scrollPos, scrollWidth - containerWidth))
      
      scrollContainer.scrollTo({
        left: scrollPos,
        behavior: 'smooth'
      })
    }
  })
}

// 电脑端当前选中的格
const selectedDesktopCase = ref<number | null>(null)

// 电脑端变格规则页面分类展开状态
const desktopExpandedCategories = reactive({
  noun: false,
  adjective: false,
  'personal-pronoun': false,
  'possessive-pronoun': false,
  other: false
} as Record<string, boolean>)

// 电脑端变格规则页面当前选中的分类
const selectedDesktopCategory = ref<string | null>(null)

// 切换电脑端分类展开状态
const toggleDesktopCategory = (categoryId: string) => {
  if (desktopExpandedCategories[categoryId]) {
    desktopExpandedCategories[categoryId] = false
    selectedDesktopCategory.value = null
  } else {
    Object.keys(desktopExpandedCategories).forEach(key => {
      desktopExpandedCategories[key] = false
    })
    desktopExpandedCategories[categoryId] = true
    selectedDesktopCategory.value = categoryId
  }
  selectedDesktopCase.value = null
  nextTick(() => {
    const rulesContent = document.querySelector('.rules-content') as HTMLElement
    if (rulesContent) {
      rulesContent.scrollTop = 0
    }
  })
}

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

// 选择性别（形容词和物主代词训练）
const selectGender = (gender: string) => {
  selectedGender.value = gender
  adjPossTrainingState.value = 'practice'
  // 根据训练类型加载相应的题目
  if (currentAdjPossType.value === 'adjective') {
    loadAdjectivePracticeSentence()
  } else if (currentAdjPossType.value === 'possessive') {
    loadPossessivePracticeSentence()
  }
}

// 返回性别选择页面
const backToGenderSelect = () => {
  adjPossTrainingState.value = 'select-gender'
  selectedGender.value = null
  // 根据训练类型重置相应的状态
  if (currentAdjPossType.value === 'adjective') {
    resetAdjectivePracticeState()
  } else if (currentAdjPossType.value === 'possessive') {
    resetPossessivePracticeState()
  }
}

// 重置形容词训练状态
const resetAdjectivePracticeState = () => {
  currentAdjectiveSentence.value = null
  adjectiveSelectedEnding.value = ''
  adjectiveShowDropdown.value = false
  adjectiveAnswerResult.value = null
  adjectiveShowResult.value = false
  usedAdjectiveSentences.value = []
}

// 重置物主代词训练状态
const resetPossessivePracticeState = () => {
  currentAdjectiveSentence.value = null
  adjectiveSelectedEnding.value = ''
  adjectiveShowDropdown.value = false
  adjectiveAnswerResult.value = null
  adjectiveShowResult.value = false
  usedPossessiveSentences.value = []
  lastPossessiveWord.value = ''
}

// 加载形容词训练题目
const loadAdjectivePracticeSentence = () => {
  // 重置当前题目的状态
  adjectiveSelectedEnding.value = ''
  adjectiveShowDropdown.value = false
  adjectiveAnswerResult.value = null
  adjectiveShowResult.value = false
  
  // 过滤出符合当前性别和训练类型的题目
  let availableSentences = adjectiveTrainingSentences.value.filter(sentence => {
    if (selectedGender.value === '阳性/中性') {
      return sentence.gender === '阳性' || sentence.gender === '中性'
    }
    return sentence.gender === selectedGender.value
  })
  
  // 排除已经使用过的题目
  availableSentences = availableSentences.filter(sentence => 
    !usedAdjectiveSentences.value.includes(sentence.id)
  )
  
  // 如果所有题目都用过了，重置已使用题目列表
  if (availableSentences.length === 0) {
    usedAdjectiveSentences.value = []
    availableSentences = adjectiveTrainingSentences.value.filter(sentence => {
      if (selectedGender.value === '阳性/中性') {
        return sentence.gender === '阳性' || sentence.gender === '中性'
      }
      return sentence.gender === selectedGender.value
    })
  }
  
  // 随机选择一个题目
  const randomIndex = Math.floor(Math.random() * availableSentences.length)
  const selectedSentence = availableSentences[randomIndex]
  if (selectedSentence) {
    // 打乱答案选项顺序
    const shuffledEndings = shuffleArray([...selectedSentence.possibleEndings])
    
    currentAdjectiveSentence.value = {
      ...selectedSentence,
      possibleEndings: shuffledEndings
    }
    
    // 记录已使用的题目
    usedAdjectiveSentences.value.push(selectedSentence.id)
  }
}

// 加载物主代词训练题目（包含打乱顺序逻辑）
const loadPossessivePracticeSentence = () => {
  // 重置当前题目的状态
  adjectiveSelectedEnding.value = ''
  adjectiveShowDropdown.value = false
  adjectiveAnswerResult.value = null
  adjectiveShowResult.value = false
  
  // 过滤出符合当前性别的题目
  let availableSentences = possessiveTrainingSentences.value.filter(sentence => {
    if (selectedGender.value === '阳性/中性') {
      return sentence.gender === '阳性' || sentence.gender === '中性'
    }
    return sentence.gender === selectedGender.value
  })
  
  // 排除已经使用过的题目
  availableSentences = availableSentences.filter(sentence => 
    !usedPossessiveSentences.value.includes(sentence.id)
  )
  
  // 如果所有题目都用过了，重置已使用题目列表
  if (availableSentences.length === 0) {
    usedPossessiveSentences.value = []
    availableSentences = possessiveTrainingSentences.value.filter(sentence => {
      if (selectedGender.value === '阳性/中性') {
        return sentence.gender === '阳性' || sentence.gender === '中性'
      }
      return sentence.gender === selectedGender.value
    })
  }
  
  // 过滤掉与上一个物主代词相同的题目（至少隔2道题）
  if (lastPossessiveWord.value) {
    const filteredSentences = availableSentences.filter(sentence => {
      const currentWord = sentence.targetWord.toLowerCase()
      const lastWord = lastPossessiveWord.value.toLowerCase()
      return currentWord !== lastWord
    })
    
    // 如果过滤后还有题目，使用过滤后的；否则使用原来的
    if (filteredSentences.length > 0) {
      availableSentences = filteredSentences
    }
  }
  
  // 随机选择一个题目
  const randomIndex = Math.floor(Math.random() * availableSentences.length)
  const selectedSentence = availableSentences[randomIndex]
  if (selectedSentence) {
    // 打乱答案选项顺序
    const shuffledEndings = shuffleArray([...selectedSentence.possibleEndings])
    
    currentAdjectiveSentence.value = {
      ...selectedSentence,
      possibleEndings: shuffledEndings
    }
    
    // 记录已使用的题目和上一个物主代词
    usedPossessiveSentences.value.push(selectedSentence.id)
    lastPossessiveWord.value = selectedSentence.targetWord
  }
}

// 处理形容词训练句子点击
const handleAdjectiveSentenceClick = (event: MouseEvent) => {
  if (!currentAdjectiveSentence.value) return
  
  const target = event.target as HTMLElement
  if (target.classList.contains('target-word') || target.closest('.target-word')) {
    const clickableTarget = target.classList.contains('target-word') 
      ? target 
      : target.closest('.target-word') as HTMLElement
    adjectiveShowDropdown.value = !adjectiveShowDropdown.value
    if (adjectiveShowDropdown.value) {
      const rect = clickableTarget.getBoundingClientRect()
      adjectiveDropdownTop.value = rect.bottom + 5
      adjectiveDropdownLeft.value = rect.left
    }
  }
}

// 选择形容词词尾
const chooseAdjectiveEnding = (ending: string) => {
  if (!currentAdjectiveSentence.value) return
  
  adjectiveSelectedEnding.value = ending
  adjectiveShowDropdown.value = false
  
  // 检查答案
  if (ending === currentAdjectiveSentence.value.correctEnding) {
    adjectiveAnswerResult.value = 'correct'
  } else {
    adjectiveAnswerResult.value = 'incorrect'
  }
  adjectiveShowResult.value = true
}

// 形容词/物主代词训练下一题
const adjectiveNextQuestion = () => {
  // 根据训练类型加载相应的题目
  if (currentAdjPossType.value === 'adjective') {
    loadAdjectivePracticeSentence()
  } else if (currentAdjPossType.value === 'possessive') {
    loadPossessivePracticeSentence()
  }
}

// 生成形容词/物主代词训练句子的HTML
const adjectiveFullSentenceHtml = computed(() => {
  if (!currentAdjectiveSentence.value) return ''
  
  const sentence = currentAdjectiveSentence.value
  const targetWord = sentence.targetWord
  
  // 生成带标红的目标词（仅在未选择词尾时显示）
  let targetWordWithRedEnding = targetWord
  
  if (!adjectiveSelectedEnding.value) {
    if (currentAdjPossType.value === 'adjective') {
      // 形容词标红逻辑（阳性/中性：ый, ой, ий；阴性：ая, яя；复数：ые, ие）
      const endings = ['ый', 'ой', 'ий', 'ая', 'яя', 'ые', 'ие']
      let foundEnding = ''
      
      // 查找匹配的词尾
      for (const ending of endings) {
        if (targetWord.endsWith(ending)) {
          foundEnding = ending
          break
        }
      }
      
      // 如果找到词尾，标红显示
      if (foundEnding) {
        const base = targetWord.slice(0, -foundEnding.length)
        targetWordWithRedEnding = `${base}<span class="red-ending">${foundEnding}</span>`
      }
    } else if (currentAdjPossType.value === 'possessive') {
      // 物主代词标红逻辑
      // 检查是否是"весь"、"чей"及其变体
      const specialWords = ['весь', 'Весь', 'всё', 'Всё', 'чей', 'Чей', 'чьё', 'Чьё']
      if (specialWords.includes(targetWord)) {
        // 特殊词不标红
        targetWordWithRedEnding = targetWord
      } else {
        // 标红末尾元音字母或"й"
        const vowelsAndY = 'аеёиоуыэюяАЕЁИОУЫЭЮЯйЙ'
        const lastChar = targetWord[targetWord.length - 1]
        
        if (lastChar && vowelsAndY.includes(lastChar)) {
          // 标红末尾元音或"й"
          const base = targetWord.slice(0, -1)
          targetWordWithRedEnding = `${base}<span class="red-ending">${lastChar}</span>`
        }
        // 辅音结尾不标红
      }
    }
  } else if (adjectiveSelectedEnding.value === '/') {
    // 如果选择了 "/"，显示原始词（不变格）
    targetWordWithRedEnding = targetWord
  } else {
    // 如果已选择词尾，显示选择的词尾
    let base = targetWord
    
    if (currentAdjPossType.value === 'adjective') {
      // 形容词：移除原始词尾
      const endings = ['ый', 'ой', 'ий', 'ая', 'яя', 'ые', 'ие']
      for (const ending of endings) {
        if (targetWord.endsWith(ending)) {
          base = targetWord.slice(0, -ending.length)
          break
        }
      }
      // 显示带标红的选择词尾
      targetWordWithRedEnding = `${base}<span class="red-ending">${adjectiveSelectedEnding.value}</span>`
    } else if (currentAdjPossType.value === 'possessive') {
      // 物主代词：检查是否是"весь"、"чей"及其变体
      const specialWords = ['весь', 'Весь', 'всё', 'Всё', 'чей', 'Чей', 'чьё', 'Чьё']
      if (specialWords.includes(targetWord)) {
        // 特殊词：直接显示完整单词
        targetWordWithRedEnding = adjectiveSelectedEnding.value
      } else {
        // 不是特殊词：检查词尾类型
        const vowelsAndY = 'аеёиоуыэюяАЕЁИОУЫЭЮЯйЙ'
        const lastChar = targetWord[targetWord.length - 1]
        if (lastChar && vowelsAndY.includes(lastChar)) {
          // 元音或"й"结尾：移除末尾字符，替换词尾
          base = targetWord.slice(0, -1)
        }
        // 辅音结尾：不移除末尾字符，直接添加词尾
        // 显示带标红的选择词尾
        targetWordWithRedEnding = `${base}<span class="red-ending">${adjectiveSelectedEnding.value}</span>`
      }
    }
  }
  
  return sentence.text.replace(targetWord, `<span class="target-word">${targetWordWithRedEnding}</span>`)
})

// 选择人称（人称代词训练）
const selectPerson = (person: string) => {
  selectedPerson.value = person
  pronounTrainingState.value = 'practice'
  loadPersonalPronounPracticeSentence()
}

// 返回人称选择页面
const backToPersonSelect = () => {
  pronounTrainingState.value = 'select-person'
  selectedPerson.value = null
  resetPersonalPronounPracticeState()
}

// 重置人称代词训练状态
const resetPersonalPronounPracticeState = () => {
  currentPersonalPronounSentence.value = null
  personalPronounSelectedEnding.value = ''
  personalPronounShowDropdown.value = false
  personalPronounAnswerResult.value = null
  personalPronounShowResult.value = false
  usedPersonalPronounSentences.value = []
}

// 加载人称代词训练题目
const loadPersonalPronounPracticeSentence = () => {
  // 重置当前题目的状态
  personalPronounSelectedEnding.value = ''
  personalPronounShowDropdown.value = false
  personalPronounAnswerResult.value = null
  personalPronounShowResult.value = false
  
  // 过滤出符合当前人称的题目
  let availableSentences = personalPronounTrainingSentences.value.filter(sentence => {
    return sentence.gender === (selectedPerson.value === '单数人称' ? '单数' : '复数')
  })
  
  // 排除已经使用过的题目
  availableSentences = availableSentences.filter(sentence => 
    !usedPersonalPronounSentences.value.includes(sentence.id)
  )
  
  // 如果所有题目都用过了，重置已使用题目列表
  if (availableSentences.length === 0) {
    usedPersonalPronounSentences.value = []
    availableSentences = personalPronounTrainingSentences.value.filter(sentence => {
      return sentence.gender === (selectedPerson.value === '单数人称' ? '单数' : '复数')
    })
  }
  
  // 随机选择一个题目
  const randomIndex = Math.floor(Math.random() * availableSentences.length)
  const selectedSentence = availableSentences[randomIndex]
  if (selectedSentence) {
    // 打乱答案选项顺序
    const shuffledEndings = shuffleArray([...selectedSentence.possibleEndings])
    
    currentPersonalPronounSentence.value = {
      ...selectedSentence,
      possibleEndings: shuffledEndings
    }
    
    // 记录已使用的题目
    usedPersonalPronounSentences.value.push(selectedSentence.id)
  }
}

// 处理人称代词训练句子点击
const handlePersonalPronounSentenceClick = (event: MouseEvent) => {
  if (!currentPersonalPronounSentence.value) return
  
  const target = event.target as HTMLElement
  if (target.classList.contains('target-word') || target.closest('.target-word')) {
    const clickableTarget = target.classList.contains('target-word') 
      ? target 
      : target.closest('.target-word') as HTMLElement
    personalPronounShowDropdown.value = !personalPronounShowDropdown.value
    if (personalPronounShowDropdown.value) {
      const rect = clickableTarget.getBoundingClientRect()
      adjectiveDropdownTop.value = rect.bottom + 5
      adjectiveDropdownLeft.value = rect.left
    }
  }
}

// 选择人称代词词尾
const choosePersonalPronounEnding = (ending: string) => {
  if (!currentPersonalPronounSentence.value) return
  
  personalPronounSelectedEnding.value = ending
  personalPronounShowDropdown.value = false
  
  // 检查答案
  if (ending === currentPersonalPronounSentence.value.correctEnding) {
    personalPronounAnswerResult.value = 'correct'
  } else {
    personalPronounAnswerResult.value = 'incorrect'
  }
  personalPronounShowResult.value = true
}

// 人称代词训练下一题
const personalPronounNextQuestion = () => {
  loadPersonalPronounPracticeSentence()
}

// 生成形容词选项（基于正确答案生成一些变体）
const generateAdjectiveOptions = (correctAdj: string, targetAdj: string, caseNum: number, number: string): string[] => {
  const options = [correctAdj, targetAdj]
  
  // 根据格和数生成一些常见的变体
  const adjEndings: Record<string, Record<string, string[]>> = {
    '阳性': {
      '1': ['ый', 'ий', 'ой'],
      '2': ['ого', 'его'],
      '3': ['ому', 'ему'],
      '4': ['ый', 'ий', 'ой', 'ого', 'его'],
      '5': ['ым', 'им'],
      '6': ['ом', 'ем']
    },
    '阴性': {
      '1': ['ая', 'яя'],
      '2': ['ой', 'ей'],
      '3': ['ой', 'ей'],
      '4': ['ую', 'юю'],
      '5': ['ой', 'ей'],
      '6': ['ой', 'ей']
    },
    '中性': {
      '1': ['ое', 'ее'],
      '2': ['ого', 'его'],
      '3': ['ому', 'ему'],
      '4': ['ое', 'ее'],
      '5': ['ым', 'им'],
      '6': ['ом', 'ем']
    }
  }
  
  // 复数形式
  const pluralEndings: Record<string, string[]> = {
    '1': ['ые', 'ие'],
    '2': ['ых', 'их'],
    '3': ['ым', 'им'],
    '4': ['ые', 'их'],
    '5': ['ыми', 'ими'],
    '6': ['ых', 'их']
  }
  
  // 尝试从targetAdj提取词干并生成变体
  const base = targetAdj.replace(/(ый|ий|ой|ая|яя|ое|ее|ые|ие)$/g, '')
  
  if (number === '复数') {
    const endings = pluralEndings[caseNum.toString()] || ['ые', 'их']
    endings.forEach(ending => {
      if (!options.includes(base + ending)) {
        options.push(base + ending)
      }
    })
  } else {
    // 单数 - 尝试判断性
    let gender = '阳性'
    if (targetAdj.endsWith('ая') || targetAdj.endsWith('яя')) gender = '阴性'
    else if (targetAdj.endsWith('ое') || targetAdj.endsWith('ее')) gender = '中性'
    
    const genderEndings = adjEndings[gender]
    const caseEndings = genderEndings ? genderEndings[caseNum.toString()] : undefined
    const endings = caseEndings || ['ый', 'ого']
    endings.forEach(ending => {
      if (!options.includes(base + ending)) {
        options.push(base + ending)
      }
    })
  }
  
  // 确保至少有3个选项
  while (options.length < 3) {
    options.push(targetAdj)
  }
  
  // 随机打乱选项顺序，避免正确答案总是第一个
  return options.slice(0, 4).sort(() => Math.random() - 0.5)
}

// 生成名词选项（基于正确答案生成一些变体）
const generateNounOptions = (correctNoun: string, targetNoun: string, _caseNum: number, _number: string): string[] => {
  const options = [correctNoun, targetNoun]
  
  // 根据格和数生成一些常见的变体
  // 这里简化处理，添加一些常见的变格形式
  const commonEndings = ['а', 'ы', 'е', 'у', 'ой', 'е', 'ов', 'ам', 'ами', 'ах']
  
  // 尝试从targetNoun提取词干
  const base = targetNoun.replace(/(а|я|о|е|и|ы|ов|ев|ей)$/g, '')
  
  commonEndings.forEach(ending => {
    const variant = base + ending
    if (!options.includes(variant) && variant !== targetNoun) {
      options.push(variant)
    }
  })
  
  // 确保至少有3个选项
  while (options.length < 3) {
    options.push(targetNoun)
  }
  
  // 随机打乱选项顺序，避免正确答案总是第一个
  return options.slice(0, 4).sort(() => Math.random() - 0.5)
}

// 生成数词+名词训练的名词选项（专门处理，确保不包含数词）
const generateNumNounOptions = (correctNoun: string, targetNoun: string, _caseNum: number, _number: string): string[] => {
  const options = [correctNoun]
  
  // 从targetNoun中提取纯名词部分（去掉数字）
  // targetNoun可能是"25 ученик"这样的格式
  const targetParts = targetNoun.split(' ')
  const pureTargetNoun = targetParts.length > 1 ? targetParts.slice(1).join(' ') : targetNoun
  
  // 常见的数词，用于过滤
  const numerals = ['один', 'одна', 'одно', 'одного', 'одной', 'одним', 'одними',
                   'два', 'две', 'двух', 'двум', 'двумя',
                   'три', 'трёх', 'трём', 'тремя',
                   'четыре', 'четырёх', 'четырём', 'четырьмя',
                   'пять', 'пяти', 'пятью',
                   'восемь', 'восьми', 'восемью',
                   'десять', 'десяти', 'десятью',
                   'двадцать', 'двадцати', 'двадцатью',
                   'тридцать', 'тридцати', 'тридцатью',
                   'сорок', 'сорока',
                   'пятьдесят', 'пятидесяти', 'пятьюдесятью',
                   'шестьдесят', 'шестидесяти', 'шестьюдесятью',
                   'семьдесят', 'семидесяти', 'семьюдесятью',
                   'восемьдесят', 'восьмидесяти', 'восемьюдесятью',
                   'девяносто', 'девяноста',
                   'сто', 'ста', 'сот',
                   'шесть', 'шести', 'шестью',
                   'семь', 'семи', 'семью',
                   'девять', 'девяти', 'девятью']
  
  // 根据格和数生成一些常见的变体
  const commonEndings = ['а', 'ы', 'е', 'у', 'ой', 'е', 'ов', 'ев', 'ей', 'ам', 'ами', 'ах', 'ям', 'ями', 'ях', 'ой', 'ом', 'ем']
  
  // 尝试从纯名词提取词干
  const base = pureTargetNoun.replace(/(а|я|о|е|и|ы|ов|ев|ей|ь|й)$/g, '')
  
  commonEndings.forEach(ending => {
    const variant = base + ending
    if (!options.includes(variant) && variant !== pureTargetNoun && variant.length > 1 && !numerals.includes(variant)) {
      options.push(variant)
    }
  })
  
  // 添加一些常见的变格形式（基于纯名词）
  if (pureTargetNoun.endsWith('а')) {
    const variants = [pureTargetNoun.replace(/а$/, 'ы'), pureTargetNoun.replace(/а$/, 'е'), pureTargetNoun.replace(/а$/, 'у'), pureTargetNoun.replace(/а$/, 'ой'), pureTargetNoun.replace(/а$/, 'е'), pureTargetNoun.replace(/а$/, 'ам'), pureTargetNoun.replace(/а$/, 'ами'), pureTargetNoun.replace(/а$/, 'ах')]
    variants.forEach(variant => {
      if (!options.includes(variant) && !numerals.includes(variant)) {
        options.push(variant)
      }
    })
  } else if (pureTargetNoun.endsWith('я')) {
    const variants = [pureTargetNoun.replace(/я$/, 'и'), pureTargetNoun.replace(/я$/, 'е'), pureTargetNoun.replace(/я$/, 'ю'), pureTargetNoun.replace(/я$/, 'ёй'), pureTargetNoun.replace(/я$/, 'е'), pureTargetNoun.replace(/я$/, 'ям'), pureTargetNoun.replace(/я$/, 'ями'), pureTargetNoun.replace(/я$/, 'ях')]
    variants.forEach(variant => {
      if (!options.includes(variant) && !numerals.includes(variant)) {
        options.push(variant)
      }
    })
  } else if (pureTargetNoun.endsWith('о')) {
    const variants = [pureTargetNoun.replace(/о$/, 'а'), pureTargetNoun.replace(/о$/, 'у'), pureTargetNoun.replace(/о$/, 'ом'), pureTargetNoun.replace(/о$/, 'е'), pureTargetNoun.replace(/о$/, 'ам'), pureTargetNoun.replace(/о$/, 'ами'), pureTargetNoun.replace(/о$/, 'ах')]
    variants.forEach(variant => {
      if (!options.includes(variant) && !numerals.includes(variant)) {
        options.push(variant)
      }
    })
  } else if (pureTargetNoun.endsWith('е')) {
    const variants = [pureTargetNoun.replace(/е$/, 'я'), pureTargetNoun.replace(/е$/, 'ю'), pureTargetNoun.replace(/е$/, 'ем'), pureTargetNoun.replace(/е$/, 'ях')]
    variants.forEach(variant => {
      if (!options.includes(variant) && !numerals.includes(variant)) {
        options.push(variant)
      }
    })
  } else if (pureTargetNoun.endsWith('ь')) {
    const variants = [pureTargetNoun.replace(/ь$/, 'и'), pureTargetNoun.replace(/ь$/, 'ью'), pureTargetNoun.replace(/ь$/, 'е'), pureTargetNoun.replace(/ь$/, 'ями'), pureTargetNoun.replace(/ь$/, 'ях')]
    variants.forEach(variant => {
      if (!options.includes(variant) && !numerals.includes(variant)) {
        options.push(variant)
      }
    })
  } else if (pureTargetNoun.endsWith('ы')) {
    const variants = [pureTargetNoun.replace(/ы$/, 'а'), pureTargetNoun.replace(/ы$/, 'ам'), pureTargetNoun.replace(/ы$/, 'ами'), pureTargetNoun.replace(/ы$/, 'ах')]
    variants.forEach(variant => {
      if (!options.includes(variant) && !numerals.includes(variant)) {
        options.push(variant)
      }
    })
  }
  
  // 去重并限制选项数量
  // 注意：对于1格题目，correctNoun可能等于pureTargetNoun，所以不能只保留correctNoun
  const uniqueOptions = [...new Set(options)].filter(opt => {
    if (!opt) return false
    // 检查选项是否包含任何数词
    const containsNumeral = numerals.some(numeral => opt.includes(numeral))
    return !containsNumeral
  })
  
  // 确保至少有2个选项（包括正确答案）
  if (uniqueOptions.length < 2) {
    // 如果选项不足，添加一些基于词干的变体
    const additionalEndings = ['и', 'а', 'у', 'ом', 'е', 'ы', 'ов', 'ам', 'ами', 'ах']
    for (const ending of additionalEndings) {
      if (uniqueOptions.length >= 2) break
      const variant = base + ending
      if (variant && !uniqueOptions.includes(variant) && !numerals.includes(variant)) {
        uniqueOptions.push(variant)
      }
    }
  }
  
  // 如果仍然不足，添加correctNoun（确保正确答案一定在选项中）
  while (uniqueOptions.length < 2) {
    if (!uniqueOptions.includes(correctNoun)) {
      uniqueOptions.push(correctNoun)
    } else {
      // 如果correctNoun已经在列表中，添加pureTargetNoun作为干扰项
      if (!uniqueOptions.includes(pureTargetNoun)) {
        uniqueOptions.push(pureTargetNoun)
      }
      break
    }
  }
  
  // 随机打乱选项顺序
  return shuffleArray(uniqueOptions.slice(0, 4))
}

// 加载形容词+名词组合训练题目
const loadAdjNounCombinedSentence = () => {
  // 重置当前题目的状态
  adjNounSelectedAdjective.value = ''
  adjNounSelectedNoun.value = ''
  adjNounShowDropdown.value = null
  adjNounShowResult.value = false
  adjNounAnswerResult.value = null
  
  // 获取未使用过的题目，根据筛选条件过滤
  let availableSentences = adjNounCombinedSentences.value.filter(sentence => 
    !usedAdjNounSentences.value.includes(sentence.id) && 
    (adjNounCaseFilter.value === null || sentence.case === adjNounCaseFilter.value)
  )
  
  // 如果所有题目都已使用，重置已使用列表
  if (availableSentences.length === 0) {
    usedAdjNounSentences.value = []
    availableSentences = adjNounCombinedSentences.value.filter(sentence => 
      adjNounCaseFilter.value === null || sentence.case === adjNounCaseFilter.value
    )
  }
  
  // 随机选择一道题目
  const randomIndex = Math.floor(Math.random() * availableSentences.length)
  const sentence = availableSentences[randomIndex]
  
  if (!sentence) return
  
  // 解析正确答案中的形容词和名词
  const correctParts = sentence.correctAnswer.split(' ')
  const correctAdjective = correctParts[0]
  const correctNoun = correctParts.slice(1).join(' ')
  
  // 解析目标词中的形容词和名词
  const targetParts = sentence.targetWord.split(' ')
  const targetAdjective = targetParts[0]
  const targetNoun = targetParts.slice(1).join(' ')
  
  // 动态生成选项
  currentAdjNounSentence.value = {
    ...sentence,
    correctAdjective: correctAdjective || '',
    correctNoun: correctNoun || '',
    targetAdjective: targetAdjective || '',
    targetNoun: targetNoun || '',
    adjectiveOptions: generateAdjectiveOptions(correctAdjective || '', targetAdjective || '', sentence.case, sentence.number),
    nounOptions: generateNounOptions(correctNoun || '', targetNoun || '', sentence.case, sentence.number)
  }
}

// 处理形容词点击
const handleAdjectiveClick = (event: MouseEvent) => {
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  adjNounDropdownTop.value = rect.bottom + window.scrollY
  adjNounDropdownLeft.value = rect.left + window.scrollX
  adjNounShowDropdown.value = 'adjective'
}

// 处理名词点击
const handleNounClick = (event: MouseEvent) => {
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  adjNounDropdownTop.value = rect.bottom + window.scrollY
  adjNounDropdownLeft.value = rect.left + window.scrollX
  adjNounShowDropdown.value = 'noun'
}

// 选择形容词
const chooseAdjective = (option: string) => {
  adjNounSelectedAdjective.value = option
  adjNounShowDropdown.value = null
}

// 选择名词
const chooseNoun = (option: string) => {
  adjNounSelectedNoun.value = option
  adjNounShowDropdown.value = null
}

// 检查形容词+名词组合训练答案
const checkAdjNounAnswer = () => {
  if (!currentAdjNounSentence.value) return
  
  const userAdj = adjNounSelectedAdjective.value.trim().toLowerCase()
  const userNoun = adjNounSelectedNoun.value.trim().toLowerCase()
  
  const correctAdjective = currentAdjNounSentence.value.correctAdjective.toLowerCase()
  const correctNoun = currentAdjNounSentence.value.correctNoun.toLowerCase()
  
  if (userAdj === correctAdjective && userNoun === correctNoun) {
    adjNounAnswerResult.value = 'correct'
  } else {
    adjNounAnswerResult.value = 'incorrect'
  }
  
  adjNounShowResult.value = true
  
  // 记录已使用的题目
  if (!usedAdjNounSentences.value.includes(currentAdjNounSentence.value.id)) {
    usedAdjNounSentences.value.push(currentAdjNounSentence.value.id)
  }
}

// 形容词+名词组合训练下一题
const adjNounNextQuestion = () => {
  loadAdjNounCombinedSentence()
}

// 将句子拆分为文本、形容词和名词三部分
const getAdjNounSentenceParts = computed(() => {
  if (!currentAdjNounSentence.value) return []
  
  const sentence = currentAdjNounSentence.value
  
  // 使用动态生成的targetAdjective和targetNoun
  const adjective = sentence.targetAdjective || sentence.targetWord.split(' ')[0]
  const noun = sentence.targetNoun || sentence.targetWord.split(' ').slice(1).join(' ')
  
  // 将句子拆分为三部分：形容词前的文本、形容词、形容词和名词之间的文本、名词、名词后的文本
  const adjIndex = sentence.text.indexOf(adjective)
  const nounIndex = sentence.text.indexOf(noun)
  
  const result = []
  
  // 形容词前的文本
  if (adjIndex > 0) {
    result.push({ type: 'text', content: sentence.text.substring(0, adjIndex) })
  }
  
  // 形容词
  result.push({ type: 'adjective', content: adjective })
  
  // 形容词和名词之间的文本
  const betweenText = sentence.text.substring(adjIndex + adjective.length, nounIndex)
  if (betweenText) {
    result.push({ type: 'text', content: betweenText })
  }
  
  // 名词
  result.push({ type: 'noun', content: noun })
  
  // 名词后的文本
  const afterNounText = sentence.text.substring(nounIndex + noun.length)
  if (afterNounText) {
    result.push({ type: 'text', content: afterNounText })
  }
  
  return result
})

// 加载物主代词+名词组合训练题目
const loadPossNounCombinedSentence = () => {
  // 重置当前题目的状态
  possNounSelectedPronoun.value = ''
  possNounSelectedNoun.value = ''
  possNounShowDropdown.value = null
  possNounShowResult.value = false
  possNounAnswerResult.value = null
  
  // 获取未使用过的题目，根据筛选条件过滤
  let availableSentences = possNounCombinedSentences.value.filter(sentence => 
    !usedPossNounSentences.value.includes(sentence.id) && 
    (possNounCaseFilter.value === null || sentence.case === possNounCaseFilter.value)
  )
  
  // 如果所有题目都已使用，重置已使用列表
  if (availableSentences.length === 0) {
    usedPossNounSentences.value = []
    availableSentences = possNounCombinedSentences.value.filter(sentence => 
      possNounCaseFilter.value === null || sentence.case === possNounCaseFilter.value
    )
  }
  
  // 随机选择一道题目
  const randomIndex = Math.floor(Math.random() * availableSentences.length)
  const sentence = availableSentences[randomIndex]
  
  if (!sentence) return
  
  // 解析正确答案中的物主代词和名词
  const correctParts = sentence.correctAnswer.split(' ')
  const correctPronoun = correctParts[0]
  const correctNoun = correctParts.slice(1).join(' ')
  
  // 解析目标词中的物主代词和名词
  const targetParts = sentence.targetWord.split(' ')
  const targetPronoun = targetParts[0]
  const targetNoun = targetParts.slice(1).join(' ')
  
  // 动态生成选项
  currentPossNounSentence.value = {
    ...sentence,
    correctPronoun: correctPronoun || '',
    correctNoun: correctNoun || '',
    targetPronoun: targetPronoun || '',
    targetNoun: targetNoun || '',
    pronounOptions: generatePronounOptions(correctPronoun || '', targetPronoun || '', sentence.case, sentence.number),
    nounOptions: generateNounOptions(correctNoun || '', targetNoun || '', sentence.case, sentence.number)
  }
}

// 处理物主代词点击
const handlePronounClick = (event: MouseEvent) => {
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  possNounDropdownTop.value = rect.bottom + window.scrollY
  possNounDropdownLeft.value = rect.left + window.scrollX
  possNounShowDropdown.value = 'pronoun'
}

// 处理名词点击（物主代词+名词训练）
const handlePossNounClick = (event: MouseEvent) => {
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  possNounDropdownTop.value = rect.bottom + window.scrollY
  possNounDropdownLeft.value = rect.left + window.scrollX
  possNounShowDropdown.value = 'noun'
}

// 选择物主代词
const choosePronoun = (option: string) => {
  possNounSelectedPronoun.value = option
  possNounShowDropdown.value = null
}

// 选择名词（物主代词+名词训练）
const choosePossNoun = (option: string) => {
  possNounSelectedNoun.value = option
  possNounShowDropdown.value = null
}

// 生成物主代词选项
const generatePronounOptions = (correctPronoun: string, targetPronoun: string, _caseNum: number, _number: string) => {
  const options = [correctPronoun]
  
  // 添加一些干扰项（基于目标词的变化形式）
  const distractors = getPronounDistractors(targetPronoun, correctPronoun)
  
  // 添加干扰项，直到有4个选项
  for (const distractor of distractors) {
    if (options.length >= 4) break
    if (!options.includes(distractor)) {
      options.push(distractor)
    }
  }
  
  // 如果选项不足4个，添加一些通用干扰项
  const commonDistractors = ['мой', 'твой', 'его', 'её', 'наш', 'ваш', 'их', 'свой']
  for (const distractor of commonDistractors) {
    if (options.length >= 4) break
    if (!options.includes(distractor)) {
      options.push(distractor)
    }
  }
  
  // 随机打乱选项顺序
  return options.sort(() => Math.random() - 0.5)
}

// 获取物主代词干扰项
const getPronounDistractors = (targetPronoun: string, correctPronoun: string): string[] => {
  const distractorMap: Record<string, string[]> = {
    'мой': ['моя', 'моё', 'мои', 'моего', 'моему', 'моим', 'моей', 'мою', 'моих', 'моими'],
    'твой': ['твоя', 'твоё', 'твои', 'твоего', 'твоему', 'твоим', 'твоей', 'твою', 'твоих', 'твоими'],
    'его': ['его', 'ему', 'им', 'него', 'нему', 'ним'],
    'её': ['её', 'ей', 'ею', 'неё', 'ней', 'нею'],
    'наш': ['наша', 'наше', 'наши', 'нашего', 'нашему', 'нашим', 'нашей', 'нашу', 'наших', 'нашими'],
    'ваш': ['ваша', 'ваше', 'ваши', 'вашего', 'вашему', 'вашим', 'вашей', 'вашу', 'ваших', 'вашими'],
    'их': ['их', 'им', 'ими', 'них', 'ним', 'ними'],
    'свой': ['своя', 'своё', 'свои', 'своего', 'своему', 'своим', 'своей', 'свою', 'своих', 'своими']
  }
  
  const distractors = distractorMap[targetPronoun] || []
  return distractors.filter(d => d !== correctPronoun)
}

// 检查物主代词+名词组合训练答案
const checkPossNounAnswer = () => {
  if (!currentPossNounSentence.value) return
  
  const userPronoun = possNounSelectedPronoun.value.trim().toLowerCase()
  const userNoun = possNounSelectedNoun.value.trim().toLowerCase()
  
  const correctPronoun = currentPossNounSentence.value.correctPronoun.toLowerCase()
  const correctNoun = currentPossNounSentence.value.correctNoun.toLowerCase()
  
  if (userPronoun === correctPronoun && userNoun === correctNoun) {
    possNounAnswerResult.value = 'correct'
  } else {
    possNounAnswerResult.value = 'incorrect'
  }
  
  possNounShowResult.value = true
  
  // 记录已使用的题目
  if (!usedPossNounSentences.value.includes(currentPossNounSentence.value.id)) {
    usedPossNounSentences.value.push(currentPossNounSentence.value.id)
  }
}

// 物主代词+名词组合训练下一题
const possNounNextQuestion = () => {
  loadPossNounCombinedSentence()
}

// 加载数词+名词组合训练题目
const loadNumNounCombinedSentence = () => {
  numNounSelectedNumeral.value = ''
  numNounSelectedNoun.value = ''
  numNounShowDropdown.value = null
  numNounShowResult.value = false
  numNounAnswerResult.value = null
  
  let availableSentences = numNounCombinedSentences.value.filter(sentence => 
    !usedNumNounSentences.value.includes(sentence.id) && 
    (numNounCaseFilter.value === null || sentence.case === numNounCaseFilter.value)
  )
  
  if (availableSentences.length === 0) {
    usedNumNounSentences.value = []
    availableSentences = numNounCombinedSentences.value.filter(sentence => 
      numNounCaseFilter.value === null || sentence.case === numNounCaseFilter.value
    )
  }
  
  const randomIndex = Math.floor(Math.random() * availableSentences.length)
  const sentence = availableSentences[randomIndex]
  
  if (!sentence) return
  
  // 解析正确答案，处理6格情况（可能包含介词如"о двух"）
  const correctParts = sentence.correctAnswer.split(' ')
  let correctNumeral: string
  let correctNoun: string
  
  // 检查是否以介词开头（о, в, об等）
  const prepositions = ['о', 'в', 'об', 'на', 'при', 'по', 'с', 'со', 'к', 'ко', 'у', 'из', 'от', 'до', 'для', 'про', 'через', 'под', 'над', 'перед', 'за', 'между']
  
  // 复合数词的第一部分（如"двадцать"、"сорок"等）
  const compoundFirstParts = ['двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто', 'сто']
  const compoundFirstPartsGenitive = ['двадцати', 'тридцати', 'сорока', 'пятидесяти', 'шестидесяти', 'семидесяти', 'восьмидесяти', 'девяноста', 'ста']
  const compoundFirstPartsInstrumental = ['двадцатью', 'тридцатью', 'сорок', 'пятьюдесятью', 'шестьюдесятью', 'семьюдесятью', 'восемьюдесятью', 'девяноста', 'сто']
  
  if (prepositions.includes(correctParts[0]?.toLowerCase() || '')) {
    // 6格情况：介词 + 数词 + 名词
    // 检查是否是复合数词（如"о сорока восьми странах"）
    const firstNumeralPart = correctParts[1]
    if (firstNumeralPart && compoundFirstPartsGenitive.includes(firstNumeralPart) && correctParts.length > 2) {
      // 复合数词：取前两个词作为数词
      correctNumeral = correctParts.slice(1, 3).join(' ')
      correctNoun = correctParts.slice(3).join(' ')
    } else {
      // 简单数词
      correctNumeral = correctParts[1] || ''
      correctNoun = correctParts.slice(2).join(' ')
    }
  } else {
    // 普通情况：数词 + 名词
    const firstNumeralPart = correctParts[0]
    if (firstNumeralPart && (compoundFirstParts.includes(firstNumeralPart) || compoundFirstPartsGenitive.includes(firstNumeralPart) || compoundFirstPartsInstrumental.includes(firstNumeralPart)) && correctParts.length > 1) {
      // 复合数词：取前两个词作为数词（如"двадцать пять"、"двадцати пяти"、"двадцатью пятью"）
      correctNumeral = correctParts.slice(0, 2).join(' ')
      correctNoun = correctParts.slice(2).join(' ')
    } else {
      // 简单数词
      correctNumeral = correctParts[0] || ''
      correctNoun = correctParts.slice(1).join(' ')
    }
  }
  
  const targetParts = sentence.targetWord.split(' ')
  const targetNumeral = targetParts[0]
  const targetNoun = targetParts.slice(1).join(' ')
  
  currentNumNounSentence.value = {
    ...sentence,
    correctNumeral: correctNumeral || '',
    correctNoun: correctNoun || '',
    targetNumeral: targetNumeral || '',
    targetNoun: targetNoun || '',
    numeralOptions: sentence.numeralOptions || generateNumeralOptions(correctNumeral || '', targetNumeral || '', sentence.case, sentence.number),
    nounOptions: sentence.nounOptions || generateNumNounOptions(correctNoun || '', targetNoun || '', sentence.case, sentence.number)
  }
}

const handleNumeralClick = (event: MouseEvent) => {
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  numNounDropdownTop.value = rect.bottom + window.scrollY
  numNounDropdownLeft.value = rect.left + window.scrollX
  numNounShowDropdown.value = 'numeral'
}

const handleNumNounClick = (event: MouseEvent) => {
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  numNounDropdownTop.value = rect.bottom + window.scrollY
  numNounDropdownLeft.value = rect.left + window.scrollX
  numNounShowDropdown.value = 'noun'
}

const chooseNumeral = (option: string) => {
  numNounSelectedNumeral.value = option
  numNounShowDropdown.value = null
}

const chooseNumNoun = (option: string) => {
  numNounSelectedNoun.value = option
  numNounShowDropdown.value = null
}

const generateNumeralOptions = (correctNumeral: string, targetNumeral: string, _caseNum: number, _number: string) => {
  const options = [correctNumeral]
  
  const distractors = getNumeralDistractors(targetNumeral, correctNumeral)
  
  const targetNum = parseInt(targetNumeral)
  const isTwoDigit = targetNum >= 10 && targetNum < 100
  
  for (const distractor of distractors) {
    if (options.length >= 4) break
    // 对于两位数，只添加完整的复合数词干扰项
    if (isTwoDigit) {
      // 两位数：干扰项应该是完整的复合数词形式
      if (distractor && distractor.includes(' ')) {
        if (!options.includes(distractor)) {
          options.push(distractor)
        }
      }
    } else {
      // 个位数：正常添加干扰项
      if (!options.includes(distractor)) {
        options.push(distractor)
      }
    }
  }
  
  return shuffleArray(options)
}

const getNumeralDistractors = (targetNumeral: string, correctNumeral: string) => {
  const distractors: string[] = []
  
  const targetNum = parseInt(targetNumeral)
  
  if (targetNum === 1) {
    distractors.push('одна', 'одно', 'одного', 'одной', 'одним')
  } else if (targetNum === 2) {
    distractors.push('две', 'двух', 'двум', 'двумя')
  } else if (targetNum === 3) {
    distractors.push('трёх', 'трём', 'тремя')
  } else if (targetNum === 4) {
    distractors.push('четырёх', 'четырём', 'четырьмя')
  } else if (targetNum === 5) {
    distractors.push('пяти', 'пятью')
  } else if (targetNum === 8) {
    distractors.push('восьми', 'восемью')
  } else if (targetNum === 10) {
    distractors.push('десять', 'десяти', 'десятью')
  } else if (targetNum === 25) {
    distractors.push('двадцать пять', 'двадцати пяти', 'двадцатью пятью')
  } else if (targetNum === 48) {
    distractors.push('сорок восемь', 'сорока восьми', 'сорок восемью')
  }
  
  return distractors.filter(d => d !== correctNumeral)
}

const checkNumNounAnswer = () => {
  if (!currentNumNounSentence.value) return
  
  const userNum = numNounSelectedNumeral.value.trim().toLowerCase()
  const userNoun = numNounSelectedNoun.value.trim().toLowerCase()
  
  const correctNumeral = currentNumNounSentence.value.correctNumeral.toLowerCase()
  const correctNoun = currentNumNounSentence.value.correctNoun.toLowerCase()
  
  if (userNum === correctNumeral && userNoun === correctNoun) {
    numNounAnswerResult.value = 'correct'
  } else {
    numNounAnswerResult.value = 'incorrect'
  }
  
  numNounShowResult.value = true
  
  if (!usedNumNounSentences.value.includes(currentNumNounSentence.value.id)) {
    usedNumNounSentences.value.push(currentNumNounSentence.value.id)
  }
}

const numNounNextQuestion = () => {
  loadNumNounCombinedSentence()
}

const getNumNounSentenceParts = computed(() => {
  if (!currentNumNounSentence.value) return []
  
  const sentence = currentNumNounSentence.value
  
  const numeral = sentence.targetNumeral || sentence.targetWord.split(' ')[0]
  const noun = sentence.targetNoun || sentence.targetWord.split(' ').slice(1).join(' ')
  
  const numeralIndex = sentence.text.indexOf(numeral)
  const nounIndex = sentence.text.indexOf(noun)
  
  const result = []
  
  if (numeralIndex > 0) {
    result.push({ type: 'text', content: sentence.text.substring(0, numeralIndex) })
  }
  
  result.push({ type: 'numeral', content: numeral })
  
  const betweenText = sentence.text.substring(numeralIndex + numeral.length, nounIndex)
  if (betweenText) {
    result.push({ type: 'text', content: betweenText })
  }
  
  result.push({ type: 'noun', content: noun })
  
  const afterNounText = sentence.text.substring(nounIndex + noun.length)
  if (afterNounText) {
    result.push({ type: 'text', content: afterNounText })
  }
  
  return result
})

// 将句子拆分为文本、物主代词和名词三部分
const getPossNounSentenceParts = computed(() => {
  if (!currentPossNounSentence.value) return []
  
  const sentence = currentPossNounSentence.value
  
  // 使用动态生成的targetPronoun和targetNoun
  const pronoun = sentence.targetPronoun || sentence.targetWord.split(' ')[0]
  const noun = sentence.targetNoun || sentence.targetWord.split(' ').slice(1).join(' ')
  
  // 将句子拆分为三部分：物主代词前的文本、物主代词、物主代词和名词之间的文本、名词、名词后的文本
  const pronounIndex = sentence.text.indexOf(pronoun)
  const nounIndex = sentence.text.indexOf(noun)
  
  const result = []
  
  // 物主代词前的文本
  if (pronounIndex > 0) {
    result.push({ type: 'text', content: sentence.text.substring(0, pronounIndex) })
  }
  
  // 物主代词
  result.push({ type: 'pronoun', content: pronoun })
  
  // 物主代词和名词之间的文本
  const betweenText = sentence.text.substring(pronounIndex + pronoun.length, nounIndex)
  if (betweenText) {
    result.push({ type: 'text', content: betweenText })
  }
  
  // 名词
  result.push({ type: 'noun', content: noun })
  
  // 名词后的文本
  const afterNounText = sentence.text.substring(nounIndex + noun.length)
  if (afterNounText) {
    result.push({ type: 'text', content: afterNounText })
  }
  
  return result
})

// 生成人称代词训练句子的HTML
const personalPronounFullSentenceHtml = computed(() => {
  if (!currentPersonalPronounSentence.value) return ''
  
  const sentence = currentPersonalPronounSentence.value
  const targetWord = sentence.targetWord
  
  let displayWord = targetWord
  
  // 如果已选择词尾，显示选择的完整单词
  if (personalPronounSelectedEnding.value) {
    displayWord = personalPronounSelectedEnding.value
  }
  
  // 使用正则表达式精确匹配独立的单词（前后有空格或标点符号）
  const regex = new RegExp(`(^|\\s|\\(|\\[|\\{)(${targetWord})($|\\s|\\.|,|;|:|\\?|!|\\)|\\]|\\})`, 'g')
  return sentence.text.replace(regex, `$1<span class="target-word">${displayWord}</span>$3`)
})

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
      },
      {
        id: 51,
        text: 'Он разговаривает по <strong>телефон</strong>.',
        targetWord: 'телефон',
        originalEnding: '',
        correctEnding: 'у',
        possibleEndings: ['у', 'ю', 'ам', 'ям'],
        explanation: 'телефон 是阳性名词，其第三格单数形式为 телефону。',
        case3Type: 'append'
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
    
    practiceSentence.value = shufflePossibleEndings(selectedSentence) as PracticeSentence
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
        text: 'Он читает <strong>роман</strong>.',
        targetWord: 'роман',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'роман 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 42,
        text: 'Художник рисует <strong>портрет</strong>.',
        targetWord: 'портрет',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'портрет 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 43,
        text: 'Спортсмен играет в <strong>футбол</strong>.',
        targetWord: 'футбол',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'футбол 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 44,
        text: 'Мама готовит <strong>суп</strong>.',
        targetWord: 'суп',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'суп 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 45,
        text: 'Они едят <strong>обед</strong>.',
        targetWord: 'обед',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'обед 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 46,
        text: 'Папа читает <strong>журнал</strong>.',
        targetWord: 'журнал',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'журнал 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 47,
        text: 'Ты купил <strong>компьютер</strong>?',
        targetWord: 'компьютер',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'компьютер 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 48,
        text: 'Он сидит на <strong>стул</strong>.',
        targetWord: 'стул',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'стул 阳性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 49,
        text: 'Ты видишь <strong>окно</strong>?',
        targetWord: 'окно',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'окно 中性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 50,
        text: 'Ты ешь <strong>яблоко</strong>?',
        targetWord: 'яблоко',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'яблоко 中性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 51,
        text: 'У нас есть <strong>время</strong>.',
        targetWord: 'время',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'мени', 'мю', 'мем'],
        explanation: 'время 中性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 52,
        text: 'Ты знаешь <strong>имя</strong>?',
        targetWord: 'имя',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'имени', 'имю', 'имем'],
        explanation: 'имя 中性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 53,
        text: 'Он пишет <strong>письмо</strong>.',
        targetWord: 'письмо',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'письмо 中性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 54,
        text: 'Мы строим <strong>здание</strong>.',
        targetWord: 'здание',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ия', 'ию', 'ием'],
        explanation: 'здание 中性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 55,
        text: 'Они ищут <strong>место</strong>.',
        targetWord: 'место',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'а', 'у', 'ом'],
        explanation: 'место 中性非动物名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 56,
        text: 'Он едет на <strong>лошадь</strong>.',
        targetWord: 'лошадь',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ди', 'дью', 'де'],
        explanation: 'лошадь 阴性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 57,
        text: 'Ты видишь <strong>мышь</strong>?',
        targetWord: 'мышь',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ши', 'шью', 'ше'],
        explanation: 'мышь 阴性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 58,
        text: 'Мы помним <strong>мать</strong>.',
        targetWord: 'мать',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ти', 'тью', 'те'],
        explanation: 'мать 阴性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 59,
        text: 'Ты любишь <strong>дочь</strong>?',
        targetWord: 'дочь',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ти', 'тью', 'те'],
        explanation: 'дочь 阴性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 60,
        text: 'Ты закрываешь <strong>дверь</strong>?',
        targetWord: 'дверь',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ри', 'рью', 'ре'],
        explanation: 'дверь 阴性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 61,
        text: 'Она открывает <strong>тетрадь</strong>.',
        targetWord: 'тетрадь',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ди', 'дью', 'де'],
        explanation: 'тетрадь 阴性名词，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 62,
        text: 'Ты видишь <strong>столы</strong>?',
        targetWord: 'столы',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ов', 'ам', 'ах'],
        explanation: 'столы 阳性非动物名词复数，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 63,
        text: 'Мы строим <strong>дома</strong>.',
        targetWord: 'дома',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ов', 'ам', 'ах'],
        explanation: 'дома 阳性非动物名词复数，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 64,
        text: 'Ты купил <strong>телефоны</strong>?',
        targetWord: 'телефоны',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'ов', 'ам', 'ах'],
        explanation: 'телефоны 阳性非动物名词复数，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 65,
        text: 'Ты читаешь <strong>книги</strong>?',
        targetWord: 'книги',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'г', 'гам', 'гах'],
        explanation: 'книги 阴性非动物名词复数，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 66,
        text: 'Она чистит <strong>машины</strong>.',
        targetWord: 'машины',
        originalEnding: '',
        correctEnding: '/',
        possibleEndings: ['/', 'н', 'нам', 'нах'],
        explanation: 'машины 阴性非动物名词复数，第四格不变。',
        case4Type: 'nochange'
      },
      {
        id: 67,
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
    
    practiceSentence.value = shufflePossibleEndings(selectedSentence) as PracticeSentence
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
        originalEnding: 'й',
        correctEnding: 'ем',
        possibleEndings: ['ем', 'я', 'ю', 'ом'],
        explanation: 'чай阳性名词，工具格将й改为ем',
        case5Type: 'replace'
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
    
    practiceSentence.value = shufflePossibleEndings(selectedSentence) as PracticeSentence
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
    
    practiceSentence.value = shufflePossibleEndings(selectedSentence) as PracticeSentence
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
  
  // 同时处理形容词训练的下拉菜单
  const isClickOnAdjectiveTarget = target.closest('.target-word')
  if (!isClickOnAdjectiveTarget && !isClickOnDropdown) {
    adjectiveShowDropdown.value = false
  }
  
  // 处理形容词+名词组合训练的下拉菜单
  const isClickOnAdjNounTarget = target.closest('.sentence-container .target-word')
  if (!isClickOnAdjNounTarget && !isClickOnDropdown) {
    adjNounShowDropdown.value = null
  }
  
  // 处理物主代词+名词组合训练的下拉菜单
  if (!isClickOnAdjNounTarget && !isClickOnDropdown) {
    possNounShowDropdown.value = null
  }
  
  // 处理人称代词训练的下拉菜单
  if (!isClickOnAdjectiveTarget && !isClickOnDropdown) {
    personalPronounShowDropdown.value = false
  }
  
  // 处理数词+名词组合训练的下拉菜单
  const isClickOnNumNounTarget = target.closest('.num-noun-target')
  if (!isClickOnNumNounTarget && !isClickOnDropdown) {
    numNounShowDropdown.value = null
  }
  
  // 处理筛选下拉菜单
  const isClickOnFilter = target.closest('.filter-container')
  if (!isClickOnFilter) {
    adjNounShowFilterDropdown.value = false
    possNounShowFilterDropdown.value = false
    numNounShowFilterDropdown.value = false
  }
}

// 组件挂载时添加点击事件监听器
// 浏览器历史记录导航处理
const handlePopState = (event: PopStateEvent) => {
  if (event.state && event.state.page) {
    const targetPage = event.state.page
    const targetIndex = navigationHistory.value.indexOf(targetPage)
    
    if (targetIndex !== -1) {
      historyIndex.value = targetIndex
      currentPage.value = targetPage
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // 添加浏览器历史记录监听
  window.addEventListener('popstate', handlePopState)
  
  // 初始化浏览器历史记录
  window.history.replaceState({ page: 'home' }, '', '#home')
})

// 组件卸载时移除点击事件监听器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  stopTimer()
  
  // 移除浏览器历史记录监听
  window.removeEventListener('popstate', handlePopState)
})

// 标题字母颜色切换函数
const toggleLetterColor = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  
  // 检查是否已经激活
  const isActive = target.classList.contains('active')
  
  if (isActive) {
    // 恢复默认状态
    target.classList.remove('active')
    if (target.classList.contains('blue-section')) {
      target.style.color = '#000000'
    } else if (target.classList.contains('red-section')) {
      target.style.color = '#000000'
    }
    // 显示下划线
    const afterElement = window.getComputedStyle(target, '::after')
    if (afterElement.content !== 'none') {
      target.style.setProperty('--after-opacity', '1')
    }
  } else {
    // 激活状态
    target.classList.add('active')
    if (target.classList.contains('blue-section')) {
      target.style.color = '#3498db'
    } else if (target.classList.contains('red-section')) {
      target.style.color = '#e74c3c'
    }
    // 隐藏下划线
    target.style.setProperty('--after-opacity', '0')
  }
}

// 下一题
const nextQuestion = () => {
  loadPracticeSentence()
}

// 通用的数组打乱函数
const shuffleArray = (array: any[]) => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
  return arr
}

// 打乱possibleEndings数组，同时保持其他属性不变
const shufflePossibleEndings = (sentence: any) => {
  const shuffled = { ...sentence }
  shuffled.possibleEndings = shuffleArray(sentence.possibleEndings)
  return shuffled
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

    <!-- 移动端侧边栏 -->
    <div 
      class="mobile-sidebar-overlay" 
      :class="{ 'overlay-visible': mobileSidebarOpen }"
      @click="closeMobileSidebar"
    ></div>
    <aside 
      class="mobile-sidebar" 
      :class="{ 'sidebar-open': mobileSidebarOpen }"
    >
      <div class="mobile-sidebar-header">
        <h3>菜单</h3>
        <button class="mobile-sidebar-close" @click="closeMobileSidebar">
          <span>×</span>
        </button>
      </div>
      <nav class="mobile-sidebar-nav">
        <button 
          class="mobile-sidebar-btn" 
          :class="{ active: currentPage === 'home' }"
          @click="navigateToFromSidebar('home')"
        >
          <HomeFilled class="mobile-sidebar-icon" />
          <span>主页</span>
        </button>
        <button 
          class="mobile-sidebar-btn" 
          :class="{ active: currentPage === 'declension-rules' }"
          @click="navigateToFromSidebar('declension-rules')"
        >
          <Document class="mobile-sidebar-icon" />
          <span>变格规则</span>
        </button>
        <button 
          class="mobile-sidebar-btn" 
          :class="{ active: currentPage === 'profile' }"
          @click="navigateToFromSidebar('profile')"
        >
          <Clock class="mobile-sidebar-icon" />
          <span>测试历史</span>
        </button>
      </nav>
    </aside>

    <!-- 头部栏 -->
    <header class="header">
      <button class="mobile-menu-btn mobile-only" @click="openMobileSidebar">
        <div class="menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      <h1 class="main-title" @click="navigateTo('home')">
        <span class="tech-letter blue-section" data-letter="С" @mouseover="toggleLetterColor($event)">С</span>
        <span class="tech-letter blue-section" data-letter="К" @mouseover="toggleLetterColor($event)">К</span>
        <span class="tech-letter blue-section" data-letter="Л" @mouseover="toggleLetterColor($event)">Л</span>
        <span class="tech-letter blue-section" data-letter="О" @mouseover="toggleLetterColor($event)">О</span>
        <span class="tech-letter blue-section" data-letter="Н" @mouseover="toggleLetterColor($event)">Н</span>
        <span class="tech-letter blue-section" data-letter="Е" @mouseover="toggleLetterColor($event)">Е</span>
        <span class="tech-letter blue-section" data-letter="Н" @mouseover="toggleLetterColor($event)">Н</span>
        <span class="tech-letter red-section" data-letter="И" @mouseover="toggleLetterColor($event)">И</span>
        <span class="tech-letter red-section" data-letter="Е" @mouseover="toggleLetterColor($event)">Е</span>
      </h1>
      <nav class="header-nav desktop-only">
        <button 
          class="header-nav-btn" 
          :class="{ active: currentPage === 'home' }"
          @click="navigateTo('home')"
        >
          主页
        </button>
        <button 
          class="header-nav-btn" 
          :class="{ active: currentPage === 'declension-rules' }"
          @click="navigateTo('declension-rules')"
        >
          变格规则
        </button>
        <button 
          class="header-nav-btn" 
          :class="{ active: currentPage === 'profile' }"
          @click="navigateTo('profile')"
        >
          测试历史
        </button>
      </nav>
    </header>

    <!-- 内容区 -->
    <main class="content">
      <div v-if="currentPage === 'home'" class="home-content">
        <div class="welcome-message">
          欢迎来到俄语变格训练网站 Склонение，点击下方的按钮即可开始训练。
        </div>
        <button class="training-btn" @click="navigateTo('adj-training')">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span class="btn-text">形容词训练</span>
        </button>
        <button class="training-btn" @click="navigateTo('pronoun-training')">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span class="btn-text">人称代词训练</span>
        </button>
        <button class="training-btn" @click="navigateTo('poss-training')">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span class="btn-text">物主代词训练</span>
        </button>
        <button class="training-btn" @click="navigateTo('case-training')">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
          <span class="btn-text">名词训练</span>
        </button>
        <button class="training-btn" @click="navigateTo('combined-training')">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <span class="btn-text">组合训练</span>
        </button>
        <button class="training-btn" @click="navigateTo('test')">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><circle cx="12" cy="12" r="10"></circle><polyline points="16 11.37 12 7.37 8 11.37"></polyline><line x1="12" y1="15" x2="12" y2="15"></line></svg>
          <span class="btn-text">测试</span>
        </button>
      </div>

      <!-- 指定格训练页面 -->
      <div v-else-if="currentPage === 'case-training'" class="page-content page-full-width">
        <!-- 格选择界面 -->
        <div v-if="caseTrainingState === 'select-case'" class="case-select-container">
          <h2>名词训练</h2>
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
              <ArrowLeft class="back-icon" />
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
                  <p>以-ь结尾：-ями (如：ночь → ночи → ночами)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 6">
                  <h5>单数形式</h5>
                  <p>以-а结尾：-е (如：книга → книге)</p>
                  <p>以-я结尾：-е (如：тетя → тетее)</p>
                  <p>以-ь结尾：-и (如：ночь → ночи)</p>
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
                  <p>以-е结尾：-я (如：море → моря)</p>
                  <p>以-ее结尾：-я (如：мяч → мяча)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以-о结尾：-ов (如：окно → окна → окон)</p>
                  <p>以-е结尾：-ев (如：море → моря → морей)</p>
                  <p>以-ее结尾：-ей (如：мяч → мяча → мячей)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 3">
                  <h5>单数形式</h5>
                  <p>以-о结尾：-у (如：окно → окну)</p>
                  <p>以-е结尾：-ю (如：море → морю)</p>
                  <p>以-ее结尾：-ю (如：мяч → мячу)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以-о结尾：-ам (如：окно → окна → окнам)</p>
                  <p>以-е结尾：-ям (如：море → моря → морям)</p>
                  <p>以-ее结尾：-ям (如：мяч → мяча → мячам)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 4">
                  <h5>单数形式</h5>
                  <p>不变位 (如：окно → окно)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>不变位 (如：окно → окна → окна)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 5">
                  <h5>单数形式</h5>
                  <p>以-о结尾：-ом (如：окно → окном)</p>
                  <p>以-е结尾：-ем (如：море → морем)</p>
                  <p>以-ее结尾：-ем (如：мяч → мячем)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以-о结尾：-ами (如：окно → окна → окнами)</p>
                  <p>以-е结尾：-ями (如：море → моря → морями)</p>
                  <p>以-ее结尾：-ями (如：мяч → мяча → мячами)</p>
                </div>
                <div class="ending-example" v-else-if="selectedCase === 6">
                  <h5>单数形式</h5>
                  <p>以-о结尾：-е (如：окно → окне)</p>
                  <p>以-е结尾：-е (如：море → море)</p>
                  <p>以-ее结尾：-е (如：мяч → мяче)</p>
                  <p>&nbsp;</p>
                  <h5>复数形式</h5>
                  <p>以-о结尾：-ах (如：окно → окна → окнах)</p>
                  <p>以-е结尾：-ях (如：море → моря → морях)</p>
                  <p>以-ее结尾：-ях (如：мяч → мяча → мячах)</p>
                </div>
              </div>
            </div>

            <div class="tutorial-footer">
              <button class="start-btn" @click="caseTrainingState = 'practice'; loadPracticeSentence()">开始训练</button>
            </div>
          </div>
        </div>

        <!-- 新手教学界面 -->
        <div v-else-if="caseTrainingState === 'tutorial'" class="tutorial-container">
          <div class="tutorial-header">
            <button class="back-btn" @click="backToCaseSelect">
              <ArrowLeft class="back-icon" />
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
              <ArrowLeft class="back-icon" />
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
            <p class="question-number-tag">（{{ testQuestions[currentQuestionIndex]?.number }}）</p>
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
            <p class="question-number-tag">（{{ testQuestions[currentQuestionIndex]?.number }}）</p>
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
        <h2 class="mobile-only">变格规则</h2>
        
        <!-- 分类导航条 - 可滑动 -->
        <div class="rules-category-nav mobile-only" ref="rulesCategoryNav">
          <div class="category-scroll" ref="categoryScroll">
            <button 
              v-for="cat in [
                { id: 'noun', label: '名词' },
                { id: 'adjective', label: '形容词' },
                { id: 'personal-pronoun', label: '人称代词' },
                { id: 'possessive-pronoun', label: '物主代词' },
                { id: 'numeral', label: '数词' },
                { id: 'other', label: '其他' }
              ]" 
              :key="cat.id"
              :ref="el => { if (el) setCategoryBtnRef(cat.id, el) }"
              class="category-btn"
              :class="{ active: selectedRulesCategory === cat.id }"
              @click="selectRulesCategory(cat.id as RulesCategory)"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>
        
        <p class="instruction mobile-only" v-if="selectedRulesCategory === 'noun'">名词变格规则</p>
        <p class="instruction mobile-only" v-else-if="selectedRulesCategory === 'adjective'">形容词变格规则</p>
        <p class="instruction mobile-only" v-else-if="selectedRulesCategory === 'personal-pronoun'">人称代词变格规则</p>
        <p class="instruction mobile-only" v-else-if="selectedRulesCategory === 'possessive-pronoun'">物主代词变格规则</p>
        <p class="instruction mobile-only" v-else-if="selectedRulesCategory === 'numeral'">数词变格规则</p>
        <p class="instruction mobile-only" v-else-if="selectedRulesCategory === 'other'">指示代词、疑问词、反身代词变格规则</p>
        
        <!-- 变格规则内容 - 移动端 -->
        <div class="declension-rules mobile-only">
          <!-- 名词分类 -->
          <template v-if="selectedRulesCategory === 'noun'">
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
                <div class="case-auxiliary">
                  <h4>标志词</h4>
                  <table class="auxiliary-table">
                    <tr>
                      <td class="auxiliary-category">动词</td>
                      <td class="auxiliary-words">быть（есть）</td>
                    </tr>
                  </table>
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
            <!-- 2-6格内容继续... -->
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
                <div class="case-auxiliary">
                  <h4>标志词</h4>
                  <table class="auxiliary-table">
                    <tr>
                      <td class="auxiliary-category">无人称谓语</td>
                      <td class="auxiliary-words">нет</td>
                    </tr>
                    <tr>
                      <td class="auxiliary-category">介词</td>
                      <td class="auxiliary-words">у, из, из-за, от,<br> c（从…）, до, без, для, около, после, вокруг（周围）, вместо（代替）</td>
                    </tr>
                    <tr>
                      <td class="auxiliary-category">动词</td>
                      <td class="auxiliary-words">не иметь（没有）、<br>лишиться（失去）、<br>достичь（达到）、<br></br>касаться（涉及）、<br>добиться（获得）</td>
                    </tr>
                  </table>
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
                <div class="case-auxiliary">
                  <h4>标志词</h4>
                  <table class="auxiliary-table">
                    <tbody>
                      <tr>
                        <td class="auxiliary-category">介词</td>
                        <td class="auxiliary-words">к, по, благодаря,<br> вопреки（与……相反）, навстречу（朝着……）</td>
                      </tr>
                      <tr>
                        <td class="auxiliary-category">动词</td>
                        <td class="auxiliary-words">сниться, рад, верить, помогать, мешать（打扰）, завидовать(嫉妒), сочувствовать(建议), удивляться(惊讶), позвонить</td>
                      </tr>
                    </tbody>
                  </table>
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
                <div class="case-auxiliary">
                  <h4>标志词</h4>
                  <table class="auxiliary-table">
                    <tbody>
                      <tr>
                        <td class="auxiliary-category">介词</td>
                        <td class="auxiliary-words">на, в, за（向……，为了……）, про, через, сквозь（通过）, под（往……下面）</td>
                      </tr>
                      <tr>
                        <td class="auxiliary-category">动词</td>
                        <td class="auxiliary-words">видеть, любить, читать, делать, слушать, знать, ждать, есть（吃）</td>
                      </tr>
                    </tbody>
                  </table>
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
                <div class="case-auxiliary">
                  <h4>标志词</h4>
                  <table class="auxiliary-table">
                    <tbody>
                      <tr>
                        <td class="auxiliary-category">介词</td>
                        <td class="auxiliary-words">с, над, под, перед, между, за（在…）</td>
                      </tr>
                      <tr>
                        <td class="auxiliary-category">动词</td>
                        <td class="auxiliary-words">интересоваться（感兴趣）、гордиться（以...为荣）、обладать（拥有）、пользоваться（使用）、заниматься（从事）</td>
                      </tr>
                    </tbody>
                  </table>
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
                <div class="case-auxiliary">
                  <h4>标志词</h4>
                  <table class="auxiliary-table">
                    <tbody>
                      <tr>
                        <td class="auxiliary-category">介词</td>
                        <td class="auxiliary-words">о, об, в, на（在…）, при</td>
                      </tr>
                    </tbody>
                  </table>
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
          </template>
          
          <!-- 形容词分类 -->
          <template v-else-if="selectedRulesCategory === 'adjective'">
            <div class="declension-table-section adjective-hard-change">
              <h3>硬变化</h3>
              <p class="table-description">适用于词干以硬辅音结尾的形容词<br>（如 новый、молодой）<br>特殊：词干以 г, к, х结尾的形容词<br>（如 долгий, дорогой, русский, тихий, плохой）</p>
              <table class="declension-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>阳性</th>
                    <th>阴性</th>
                    <th>中性</th>
                    <th>复数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>-ый/-ой</td>
                    <td>-ая</td>
                    <td>-ое</td>
                    <td>-ые</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>-ого</td>
                    <td>-ой</td>
                    <td>同阳性</td>
                    <td>-ых</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>-ому</td>
                    <td>-ой</td>
                    <td>同阳性</td>
                    <td>-ым</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>1或2</td>
                    <td>-ую</td>
                    <td>1或2</td>
                    <td>1或2</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>-ым</td>
                    <td>-ой(-ою)</td>
                    <td>同阳性</td>
                    <td>-ыми</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>-ом</td>
                    <td>-ой</td>
                    <td>同阳性</td>
                    <td>-ых</td>
                  </tr>
                </tbody>
                </table>
                
                <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词（如人、动物）时，4格形式等于2格</p>
                <p class="table-note">俄语正字法要求，词干以 г, к, х结尾的形容词复数读作гы, кы, хы，写作ги, ки, хи。例如：долгие [долгые], дорогие [дорогые], русские [русскые], тихие [тихые], плохие [плохые]</p>
              </div>
              
              <!-- 软变化形容词 -->
            <div class="declension-table-section adjective-soft-change">
              <h3>软变化</h3>
              <p class="table-description">适用于词干以软辅音结尾的形容词<br>（如 синий,летний ）</p>
              
              <table class="declension-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>阳性</th>
                    <th>阴性</th>
                    <th>中性</th>
                    <th>复数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>-ий</td>
                    <td>-яя</td>
                    <td>-ее</td>
                    <td>-ие</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>-его</td>
                    <td>-ей</td>
                    <td>同阳性</td>
                    <td>-их</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>-ему</td>
                    <td>-ей</td>
                    <td>同阳性</td>
                    <td>-им</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>1或2</td>
                    <td>-юю</td>
                    <td>-ее</td>
                    <td>1或2</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>-им</td>
                    <td>-ей (-ею)</td>
                    <td>同阳性</td>
                    <td>-ими</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>-ем</td>
                    <td>-ей</td>
                    <td>同阳性</td>
                    <td>-их</td>
                  </tr>
                </tbody>
                </table>
                
                <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词（如人、动物）时，4格形式等于2格</p>
              </div>
              
              <!-- 特殊变化形容词 -->
              <div class="declension-table-section">
                <h3>特殊变化</h3>
                <p class="table-description">词干以咝音（ш, ж, ч, щ）结尾的形容词（如：хороший, свежий, горячий, настоящий）其变化基本遵从软变化规则，只是阴性1格和4格的变化不同。</p>
                
                <table class="declension-table">
                  <thead>
                    <tr>
                      <th>格</th>
                      <th>阳性</th>
                      <th>阴性</th>
                      <th>中性</th>
                      <th>复数</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1格</td>
                      <td>-ий</td>
                      <td><strong style="color: #e74c3c;">-ая</strong></td>
                      <td>-ее</td>
                      <td>-ие</td>
                    </tr>
                    <tr>
                      <td>2格</td>
                      <td>-его</td>
                      <td>-ей</td>
                      <td>同阳性</td>
                      <td>-их</td>
                    </tr>
                    <tr>
                      <td>3格</td>
                      <td>-ему</td>
                      <td>-ей</td>
                      <td>同阳性</td>
                      <td>-им</td>
                    </tr>
                    <tr>
                      <td>4格</td>
                      <td>1或2</td>
                      <td><strong style="color: #e74c3c;">-ую</strong></td>
                      <td>-ее</td>
                      <td>1或2</td>
                    </tr>
                    <tr>
                      <td>5格</td>
                      <td>-им</td>
                      <td>-ей (-ею)</td>
                      <td>同阳性</td>
                      <td>-ими</td>
                    </tr>
                    <tr>
                      <td>6格</td>
                      <td>-ем</td>
                      <td>-ей</td>
                      <td>同阳性</td>
                      <td>-их</td>
                    </tr>
                  </tbody>
                </table>
                
                <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词（如人、动物）时，4格形式等于2格</p>
              </div>
            </template>
          
          <!-- 人称代词分类 -->
          <template v-else-if="selectedRulesCategory === 'personal-pronoun'">
            <!-- 单数人称代词 -->
            <div class="declension-table-section">
              <h3>单数人称代词</h3>
              <table class="pronoun-declension-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>第一人称</th>
                    <th>第二人称</th>
                    <th>第三人称</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>я</td>
                    <td>ты</td>
                    <td>он / оно / она</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>меня</td>
                    <td>тебя</td>
                    <td>его / её</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>мне</td>
                    <td>тебе</td>
                    <td>ему / ей</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>меня</td>
                    <td>тебя</td>
                    <td>его / её</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>мной (мною)</td>
                    <td>тобой (тобою)</td>
                    <td>им / ей (ею)</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>обо мне</td>
                    <td>о тебе</td>
                    <td>о нём / о ней</td>
                  </tr>
                </tbody>
              </table>
              <p class="table-note">在大多数介词后，第三人称代词（он, она, оно, они）需要在前面加 н-。例如：к нему, от неё, без них, с ним等等</p>
            </div>
            
            <!-- 复数人称代词 -->
            <div class="declension-table-section">
              <h3>复数人称代词</h3>
              <table class="pronoun-declension-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>第一人称</th>
                    <th>第二人称</th>
                    <th>第三人称</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>мы</td>
                    <td>вы</td>
                    <td>они</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>нас</td>
                    <td>вас</td>
                    <td>их</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>нам</td>
                    <td>вам</td>
                    <td>им</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>нас</td>
                    <td>вас</td>
                    <td>их</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>нами</td>
                    <td>вами</td>
                    <td>ими</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>о нас</td>
                    <td>о вас</td>
                    <td>о них</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
          
          <!-- 物主代词分类 -->
          <template v-else-if="selectedRulesCategory === 'possessive-pronoun'">
            <!-- мой (我的) -->
            <div class="declension-table-section">
              <h3>мой</h3>
              <table class="possessive-pronoun-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>阳性</th>
                    <th>中性</th>
                    <th>阴性</th>
                    <th>复数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>мой</td>
                    <td>моё</td>
                    <td>моя</td>
                    <td>мои</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>моего</td>
                    <td>моего</td>
                    <td>моей</td>
                    <td>моих</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>моему</td>
                    <td>моему</td>
                    <td>моей</td>
                    <td>моим</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>мой/моего</td>
                    <td>моё</td>
                    <td>мою</td>
                    <td>мои/моих</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>моим</td>
                    <td>моим</td>
                    <td>моей</td>
                    <td>моими</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>моëм</td>
                    <td>моëм</td>
                    <td>моей</td>
                    <td>моих</td>
                  </tr>
                </tbody>
              </table>
              <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词（如人、动物）时，4格形式等于2格</p>
            </div>
            
            <!-- твой (你的) -->
            <div class="declension-table-section">
              <h3>твой</h3>
              <table class="possessive-pronoun-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>阳性</th>
                    <th>中性</th>
                    <th>阴性</th>
                    <th>复数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>твой</td>
                    <td>твоё</td>
                    <td>твоя</td>
                    <td>твои</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>твоего</td>
                    <td>твоего</td>
                    <td>твоей</td>
                    <td>твоих</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>твоему</td>
                    <td>твоему</td>
                    <td>твоей</td>
                    <td>твоим</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>твой/твоего</td>
                    <td>твоё</td>
                    <td>твою</td>
                    <td>твои/твоих</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>твоим</td>
                    <td>твоим</td>
                    <td>твоей</td>
                    <td>твоими</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>твоём</td>
                    <td>твоём</td>
                    <td>твоей</td>
                    <td>твоих</td>
                  </tr>
                </tbody>
              </table>
              <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词（如人、动物）时，4格形式等于2格</p>
            </div>
            
            <!-- свой (自己的) -->
            <div class="declension-table-section">
              <h3>свой (自己的) </h3>
              <table class="possessive-pronoun-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>阳性</th>
                    <th>中性</th>
                    <th>阴性</th>
                    <th>复数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>свой</td>
                    <td>своё</td>
                    <td>своя</td>
                    <td>свои</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>своего</td>
                    <td>своего</td>
                    <td>своей</td>
                    <td>своих</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>своему</td>
                    <td>своему</td>
                    <td>своей</td>
                    <td>своим</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>свой/своего</td>
                    <td>своё</td>
                    <td>свою</td>
                    <td>свои/своих</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>своим</td>
                    <td>своим</td>
                    <td>своей</td>
                    <td>своими</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>своëм</td>
                    <td>своëм</td>
                    <td>своей</td>
                    <td>своих</td>
                  </tr>
                </tbody>
              </table>
              <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词（如人、动物）时，4格形式等于2格</p>
            </div>
            
            <!-- наш (我们的) -->
            <div class="declension-table-section">
              <h3>наш</h3>
              <table class="possessive-pronoun-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>阳性</th>
                    <th>中性</th>
                    <th>阴性</th>
                    <th>复数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>наш</td>
                    <td>наше</td>
                    <td>наша</td>
                    <td>наши</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>нашего</td>
                    <td>нашего</td>
                    <td>нашей</td>
                    <td>наших</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>нашему</td>
                    <td>нашему</td>
                    <td>нашей</td>
                    <td>нашим</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>наш/нашего</td>
                    <td>наше</td>
                    <td>нашу</td>
                    <td>наши/наших</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>нашим</td>
                    <td>нашим</td>
                    <td>нашей</td>
                    <td>нашими</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>нашем</td>
                    <td>нашем</td>
                    <td>нашей</td>
                    <td>наших</td>
                  </tr>
                </tbody>
              </table>
              <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词（如人、动物）时，4格形式等于2格</p>
            </div>
            
            <!-- ваш (你们的) -->
            <div class="declension-table-section">
              <h3>ваш</h3>
              <table class="possessive-pronoun-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>阳性</th>
                    <th>中性</th>
                    <th>阴性</th>
                    <th>复数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>ваш</td>
                    <td>ваше</td>
                    <td>ваша</td>
                    <td>ваши</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>вашего</td>
                    <td>вашего</td>
                    <td>вашей</td>
                    <td>ваших</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>вашему</td>
                    <td>вашему</td>
                    <td>вашей</td>
                    <td>вашим</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>ваш/вашего</td>
                    <td>ваше</td>
                    <td>вашу</td>
                    <td>ваши/ваших</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>вашим</td>
                    <td>вашим</td>
                    <td>вашей</td>
                    <td>вашими</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>вашем</td>
                    <td>вашем</td>
                    <td>вашей</td>
                    <td>ваших</td>
                  </tr>
                </tbody>
              </table>
              <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词（如人、动物）时，4格形式等于2格</p>
            </div>
            
            <!-- его, её, их -->
            <div class="declension-table-section">
              <h3>его, её, их（不变格）</h3>
              <table class="possessive-pronoun-table-simple">
                <thead>
                  <tr>
                    <th>阳性</th>
                    <th>中性</th>
                    <th>阴性</th>
                    <th>复数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>его</td>
                    <td>его</td>
                    <td>её</td>
                    <td>их</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- весь (全部的) -->
            <div class="declension-table-section">
              <h3>весь (全部的) </h3>
              <table class="possessive-pronoun-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>阳性</th>
                    <th>中性</th>
                    <th>阴性</th>
                    <th>复数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>весь</td>
                    <td>всё</td>
                    <td>вся</td>
                    <td>все</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>всего</td>
                    <td>всего</td>
                    <td>всей</td>
                    <td>всех</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>всему</td>
                    <td>всему</td>
                    <td>всей</td>
                    <td>всем</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>весь/всего</td>
                    <td>всё</td>
                    <td>всю</td>
                    <td>все/всех</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>всем</td>
                    <td>всем</td>
                    <td>всей</td>
                    <td>всеми</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>всём</td>
                    <td>всём</td>
                    <td>всей</td>
                    <td>всех</td>
                  </tr>
                </tbody>
              </table>
              <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词（如人、动物）时，4格形式等于2格</p>
            </div>
            
            <!--чей (谁的) -->
            <div class="declension-table-section">
              <h3>чей (谁的)</h3>
              <table class="possessive-pronoun-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>阳性</th>
                    <th>中性</th>
                    <th>阴性</th>
                    <th>复数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>чей</td>
                    <td>чьё</td>
                    <td>чья</td>
                    <td>чьи</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>чьего</td>
                    <td>чьего</td>
                    <td>чьей</td>
                    <td>чьих</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>чьему</td>
                    <td>чьему</td>
                    <td>чьей</td>
                    <td>чьим</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>чей/чьего</td>
                    <td>чьё</td>
                    <td>чью</td>
                    <td>чьи/чьих</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>чьим</td>
                    <td>чьим</td>
                    <td>чьей</td>
                    <td>чьими</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>чьём</td>
                    <td>чьём</td>
                    <td>чьей</td>
                    <td>чьих</td>
                  </tr>
                </tbody>
              </table>
              <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词（如人、动物）时，4格形式等于2格</p>
            </div>
          </template>
          
          <!-- 数词分类 -->
          <template v-else-if="selectedRulesCategory === 'numeral'">
            <div class="numeral-category">
            <div class="declension-table-section">
              <h3>数词+名词 变格规则</h3>
              <p class="table-description">在俄语中，数词后面的名词不总是用1格复数形式，而是要根据数量选用特定“格”。</p>
              <table class="declension-table">
                <thead>
                  <tr>
                    <th>数词</th>
                    <th>名词格</th>
                    <th>示例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1</td><td>1格单数</td><td>один стол</td></tr>
                  <tr><td>2, 3, 4</td><td>2格单数</td><td>два стола</td></tr>
                  <tr><td>5及以上</td><td>2格复数</td><td>пять столов</td></tr>
                </tbody>
              </table>
            </div>
            
            <div class="declension-table-section numeral-rules">
              <h3>数词变格规则</h3>
              <p class="table-description">1、一般情况下，与ночь（以ь结尾的阴性名词）的变格规则类似，但不区分单复数。</p>
              <p class="table-description">2、十位数、百位数、千位数等复合数词，前后都要变化。例如：двадцать пять（25），2/3/6格为двадцати пяти，5格为двадцатью пятью</p>
              <p class="table-description">3、тысяча (千)的变格规则类似книга，但不分单复数。</p>
              <p class="table-description">4、миллион / миллиард (百万/十亿)的变格规则类似стол，但不分单复数。</p>
            </div>
            
            <div class="declension-table-section">
              <h3>数词特殊变格</h3>
              <p class="table-description">1~4、8、40、90、100</p>
            </div>
              
            <div class="declension-table-section">
              <h3>один</h3>
              <table class="declension-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>阳性</th>
                    <th>中性</th>
                    <th>阴性</th>
                    <th>复数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1格</td><td>один</td><td>одно</td><td>одна</td><td>одни</td></tr>
                  <tr><td>2格</td><td>одного</td><td>одного</td><td>одной</td><td>одних</td></tr>
                  <tr><td>3格</td><td>одному</td><td>одному</td><td>одной</td><td>одним</td></tr>
                  <tr><td>4格</td><td>同1或2</td><td>одно</td><td>одну</td><td>同1或2</td></tr>
                  <tr><td>5格</td><td>одним</td><td>одним</td><td>одной</td><td>одними</td></tr>
                  <tr><td>6格</td><td>об одном</td><td>об одном</td><td>об одной</td><td>об одних</td></tr>
                </tbody>
              </table>
              <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
            </div>
              
            <div class="declension-table-section">
              <h3>два</h3>
              <table class="declension-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>阳性 / 中性</th>
                    <th>阴性</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1格</td><td>два</td><td>две</td></tr>
                  <tr><td>2格</td><td>двух</td><td>двух</td></tr>
                  <tr><td>3格</td><td>двум</td><td>двум</td></tr>
                  <tr><td>4格</td><td>同1或2</td><td>同1或2</td></tr>
                  <tr><td>5格</td><td>двумя</td><td>двумя</td></tr>
                  <tr><td>6格</td><td>о двух</td><td>о двух</td></tr>
                </tbody>
              </table>
              <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
            </div>
              
            <div class="declension-table-section">
              <h3>три</h3>
              <table class="declension-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>变化（不分性）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1格</td><td>три</td></tr>
                  <tr><td>2格</td><td>трёх</td></tr>
                  <tr><td>3格</td><td>трём</td></tr>
                  <tr><td>4格</td><td>同1或2</td></tr>
                  <tr><td>5格</td><td>тремя</td></tr>
                  <tr><td>6格</td><td>о трёх</td></tr>
                </tbody>
              </table>
              <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
            </div>
              
            <div class="declension-table-section">
              <h3>четыре</h3>
              <table class="declension-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>变化（不分性）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1格</td><td>четыре</td></tr>
                  <tr><td>2格</td><td>четырёх</td></tr>
                  <tr><td>3格</td><td>четырём</td></tr>
                  <tr><td>4格</td><td>同1或2</td></tr>
                  <tr><td>5格</td><td>четырьмя</td></tr>
                  <tr><td>6格</td><td>о четырёх</td></tr>
                </tbody>
              </table>
              <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
            </div>
              
            <div class="declension-table-section">
              <h3>восемь</h3>
              <p class="table-description">восемь 变格时中间的 е 会脱落。</p>
              <div class="rule-text">
                <p>2/3/6格：восьми</p>
                <p>5格：восемью 或 восьмью</p>
              </div>
            </div>
              
            <div class="declension-table-section">
              <h3>сорок、девяносто、сто</h3>
              <div class="rule-text">
                <p>1/4格：原形</p>
                <p>其他格：-а (сорока, девяноста, ста)</p>
              </div>
            </div>
            </div>
          </template>
          
          <!-- 其他分类 -->
          <template v-else-if="selectedRulesCategory === 'other'">
            <!-- этот (这个) -->
            <div class="declension-table-section">
              <h3>этот</h3>
              <table class="other-pronoun-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>阳性</th>
                    <th>中性</th>
                    <th>阴性</th>
                    <th>复数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>этот</td>
                    <td>это</td>
                    <td>эта</td>
                    <td>эти</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>этого</td>
                    <td>этого</td>
                    <td>этой</td>
                    <td>этих</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>этому</td>
                    <td>этому</td>
                    <td>этой</td>
                    <td>этим</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>этот/этого</td>
                    <td>это</td>
                    <td>эту</td>
                    <td>эти/этих</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>этим</td>
                    <td>этим</td>
                    <td>этой</td>
                    <td>этими</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>этом</td>
                    <td>этом</td>
                    <td>этой</td>
                    <td>этих</td>
                  </tr>
                </tbody>
              </table>
              <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词（如人、动物）时，4格形式等于2格</p>
            </div>
            
            <!-- тот (那个) -->
            <div class="declension-table-section">
              <h3>тот</h3>
              <table class="other-pronoun-table">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>阳性</th>
                    <th>中性</th>
                    <th>阴性</th>
                    <th>复数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>тот</td>
                    <td>то</td>
                    <td>та</td>
                    <td>те</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>того</td>
                    <td>того</td>
                    <td>той</td>
                    <td>тех</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>тому</td>
                    <td>тому</td>
                    <td>той</td>
                    <td>тем</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>тот/того</td>
                    <td>то</td>
                    <td>ту</td>
                    <td>те/тех</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>тем</td>
                    <td>тем</td>
                    <td>той</td>
                    <td>теми</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>том</td>
                    <td>том</td>
                    <td>той</td>
                    <td>тех</td>
                  </tr>
                </tbody>
              </table>
              <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词（如人、动物）时，4格形式等于2格</p>
            </div>
            

            
            <!-- кто (谁) -->
            <div class="declension-table-section">
              <h3>кто</h3>
              <table class="other-pronoun-table-simple">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>形式</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>кто</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>кого</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>кому</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>кого</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>кем</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>ком</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- что (什么) -->
            <div class="declension-table-section">
              <h3>что</h3>
              <table class="other-pronoun-table-simple">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>形式</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>что</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>чего</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>чему</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>что</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>чем</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>чём</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 反身代词 -->
            <div class="declension-table-section">
              <h3>себя</h3>
              <table class="other-pronoun-table-simple">
                <thead>
                  <tr>
                    <th>格</th>
                    <th>形式</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1格</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>2格</td>
                    <td>себя</td>
                  </tr>
                  <tr>
                    <td>3格</td>
                    <td>себе</td>
                  </tr>
                  <tr>
                    <td>4格</td>
                    <td>себя</td>
                  </tr>
                  <tr>
                    <td>5格</td>
                    <td>собой</td>
                  </tr>
                  <tr>
                    <td>6格</td>
                    <td>себе</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>

        <!-- 变格规则内容 - 电脑端左右布局 -->
        <div class="declension-rules-desktop desktop-only">
          <div class="rules-sidebar">
            <!-- 名词分类（可折叠） -->
            <div class="category-group">
              <button 
                class="category-main-btn noun-category"
                :class="{ active: desktopExpandedCategories.noun }"
                @click="toggleDesktopCategory('noun')"
              >
                <span>名词</span>
                <svg class="expand-icon" :class="{ expanded: desktopExpandedCategories.noun }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div v-if="desktopExpandedCategories.noun" class="category-sub-buttons">
                <button 
                  v-for="caseNum in 6" 
                  :key="'noun-' + caseNum"
                  class="case-sidebar-btn"
                  :class="{ active: selectedDesktopCase === caseNum && selectedDesktopCategory === 'noun' }"
                  @click="toggleCaseExpansion(caseNum)"
                >
                  {{ caseNum }}格
                </button>
              </div>
            </div>
            
            <!-- 形容词分类 -->
            <button 
              class="category-main-btn"
              :class="{ active: selectedDesktopCategory === 'adjective' }"
              @click="toggleDesktopCategory('adjective')"
            >
              形容词
            </button>
            
            <!-- 人称代词分类 -->
            <button 
              class="category-main-btn"
              :class="{ active: selectedDesktopCategory === 'personal-pronoun' }"
              @click="toggleDesktopCategory('personal-pronoun')"
            >
              人称代词
            </button>
            
            <!-- 物主代词分类 -->
            <button 
              class="category-main-btn"
              :class="{ active: selectedDesktopCategory === 'possessive-pronoun' }"
              @click="toggleDesktopCategory('possessive-pronoun')"
            >
              物主代词
            </button>
            
            <!-- 数词分类 -->
            <button 
              class="category-main-btn"
              :class="{ active: selectedDesktopCategory === 'numeral' }"
              @click="toggleDesktopCategory('numeral')"
            >
              数词
            </button>
            
            <!-- 其他分类 -->
            <button 
              class="category-main-btn"
              :class="{ active: selectedDesktopCategory === 'other' }"
              @click="toggleDesktopCategory('other')"
            >
              其他
            </button>
          </div>
          <div class="rules-content">
            <template v-if="selectedDesktopCategory === 'noun' && selectedDesktopCase !== null">
              <div :key="'case-' + selectedDesktopCase">
                <!-- 1格 -->
                <template v-if="selectedDesktopCase === 1">
                  <h3>1格（主格）</h3>
                  <div class="case-function">
                    <h4>功能</h4>
                    <p>表示动作的主体或主语，回答"谁？什么？"的问题。</p>
                  </div>
                  <div class="case-auxiliary">
                    <h4>标志词</h4>
                    <table class="auxiliary-table">
                      <tr>
                        <td class="auxiliary-category">动词</td>
                        <td class="auxiliary-words">быть（есть）</td>
                      </tr>
                    </table>
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
                  <div class="case-auxiliary">
                    <h4>标志词</h4>
                    <table class="auxiliary-table">
                      <tr>
                        <td class="auxiliary-category">无人称谓语</td>
                        <td class="auxiliary-words">нет</td>
                      </tr>
                      <tr>
                        <td class="auxiliary-category">介词</td>
                        <td class="auxiliary-words">у, из, из-за, от, с（从…）, до, без, для, около, после, вокруг（周围）, вместо（代替）</td>
                      </tr>
                      <tr>
                        <td class="auxiliary-category">动词</td>
                        <td class="auxiliary-words">не иметь（没有）、лишиться（失去）、достичь（达到）、касаться（涉及）、добиться（获得）</td>
                      </tr>
                    </table>
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
                  <div class="case-auxiliary">
                    <h4>标志词</h4>
                    <table class="auxiliary-table">
                    <tbody>
                      <tr>
                        <td class="auxiliary-category">介词</td>
                        <td class="auxiliary-words">к, по, благодаря,<br> вопреки（与……相反）, навстречу（朝着……）</td>
                      </tr>
                      <tr>
                        <td class="auxiliary-category">动词</td>
                        <td class="auxiliary-words">сниться, рад, верить, помогать, мешать（打扰）, завидовать（嫉妒）, сочувствовать（建议）, удивляться（惊讶）, позвонить</td>
                      </tr>
                    </tbody>
                  </table>
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
                  <div class="case-auxiliary">
                    <h4>标志词</h4>
                  <table class="auxiliary-table">
                    <tbody>
                      <tr>
                        <td class="auxiliary-category">介词</td>
                        <td class="auxiliary-words">на, в, за（向……，为了……）, про, через, сквозь（通过）, под（往……下面）</td>
                      </tr>
                      <tr>
                        <td class="auxiliary-category">动词</td>
                        <td class="auxiliary-words">видеть, любить, читать, делать, слушать, знать, ждать, есть（吃）</td>
                      </tr>
                    </tbody>
                  </table>
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
                  <div class="case-auxiliary">
                    <h4>标志词</h4>
                    <table class="auxiliary-table">
                      <tbody>
                        <tr>
                          <td class="auxiliary-category">介词</td>
                          <td class="auxiliary-words">с, над, под, перед, между, за（在…）</td>
                        </tr>
                        <tr>
                          <td class="auxiliary-category">动词</td>
                          <td class="auxiliary-words">интересоваться（感兴趣）、гордиться（以...为荣）、обладать（拥有）、пользоваться（使用）、заниматься（从事）</td>
                        </tr>
                      </tbody>
                    </table>
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
                  <div class="case-auxiliary">
                    <h4>标志词</h4>
                    <table class="auxiliary-table">
                      <tbody>
                        <tr>
                          <td class="auxiliary-category">介词</td>
                          <td class="auxiliary-words">о, об, в, на（在…）, при</td>
                        </tr>
                      </tbody>
                    </table>
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
            
            <!-- 形容词分类内容 -->
            <template v-else-if="selectedDesktopCategory === 'adjective'">
              <div class="category-content">
                <h3>形容词变格规则</h3>
                <div class="declension-table-section">
                  <h3>硬变化</h3>
                  <p class="table-description">适用于词干以硬辅音结尾的形容词（如 новый、молодой）<br>特殊：词干以 г, к, х结尾的形容词（如 долгий, дорогой, русский, тихий, плохой）</p>
                  <table class="declension-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>阳性</th>
                        <th>阴性</th>
                        <th>中性</th>
                        <th>复数</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1格</td>
                        <td>-ый/-ой</td>
                        <td>-ая</td>
                        <td>-ое</td>
                        <td>-ые</td>
                      </tr>
                      <tr>
                        <td>2格</td>
                        <td>-ого</td>
                        <td>-ой</td>
                        <td>同阳性</td>
                        <td>-ых</td>
                      </tr>
                      <tr>
                        <td>3格</td>
                        <td>-ому</td>
                        <td>-ой</td>
                        <td>同阳性</td>
                        <td>-ым</td>
                      </tr>
                      <tr>
                        <td>4格</td>
                        <td>1或2</td>
                        <td>-ую</td>
                        <td>1或2</td>
                        <td>1或2</td>
                      </tr>
                      <tr>
                        <td>5格</td>
                        <td>-ым</td>
                        <td>-ой(-ою)</td>
                        <td>同阳性</td>
                        <td>-ыми</td>
                      </tr>
                      <tr>
                        <td>6格</td>
                        <td>-ом</td>
                        <td>-ой</td>
                        <td>同阳性</td>
                        <td>-ых</td>
                      </tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词（如人、动物）时，4格形式等于2格</p>
                  <p class="table-note">俄语正字法要求，词干以 г, к, х结尾的形容词复数读作гы, кы, хы，写作ги, ки, хи。</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>软变化</h3>
                  <p class="table-description">适用于词干以软辅音结尾的形容词（如 синий, летний）</p>
                  <table class="declension-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>阳性</th>
                        <th>阴性</th>
                        <th>中性</th>
                        <th>复数</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1格</td>
                        <td>-ий</td>
                        <td>-яя</td>
                        <td>-ее</td>
                        <td>-ие</td>
                      </tr>
                      <tr>
                        <td>2格</td>
                        <td>-его</td>
                        <td>-ей</td>
                        <td>同阳性</td>
                        <td>-их</td>
                      </tr>
                      <tr>
                        <td>3格</td>
                        <td>-ему</td>
                        <td>-ей</td>
                        <td>同阳性</td>
                        <td>-им</td>
                      </tr>
                      <tr>
                        <td>4格</td>
                        <td>1或2</td>
                        <td>-юю</td>
                        <td>-ее</td>
                        <td>1或2</td>
                      </tr>
                      <tr>
                        <td>5格</td>
                        <td>-им</td>
                        <td>-ей (-ею)</td>
                        <td>同阳性</td>
                        <td>-ими</td>
                      </tr>
                      <tr>
                        <td>6格</td>
                        <td>-ем</td>
                        <td>-ей</td>
                        <td>同阳性</td>
                        <td>-их</td>
                      </tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词（如人、动物）时，4格形式等于2格</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>特殊变化</h3>
                  <p class="table-description">词干以咝音（ш, ж, ч, щ）结尾的形容词（如：хороший, свежий, горячий, настоящий）</p>
                  <table class="declension-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>阳性</th>
                        <th>阴性</th>
                        <th>中性</th>
                        <th>复数</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1格</td>
                        <td>-ий</td>
                        <td>-ая</td>
                        <td>-ее</td>
                        <td>-ие</td>
                      </tr>
                      <tr>
                        <td>2格</td>
                        <td>-его</td>
                        <td>-ей</td>
                        <td>同阳性</td>
                        <td>-их</td>
                      </tr>
                      <tr>
                        <td>3格</td>
                        <td>-ему</td>
                        <td>-ей</td>
                        <td>同阳性</td>
                        <td>-им</td>
                      </tr>
                      <tr>
                        <td>4格</td>
                        <td>1或2</td>
                        <td>-ую</td>
                        <td>-ее</td>
                        <td>1或2</td>
                      </tr>
                      <tr>
                        <td>5格</td>
                        <td>-им</td>
                        <td>-ей (-ею)</td>
                        <td>同阳性</td>
                        <td>-ими</td>
                      </tr>
                      <tr>
                        <td>6格</td>
                        <td>-ем</td>
                        <td>-ей</td>
                        <td>同阳性</td>
                        <td>-их</td>
                      </tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词（如人、动物）时，4格形式等于2格</p>
                </div>
              </div>
            </template>
            
            <!-- 人称代词分类内容 -->
            <template v-else-if="selectedDesktopCategory === 'personal-pronoun'">
              <div class="category-content">
                <h3>人称代词变格规则</h3>
                <div class="declension-table-section">
                  <h3>单数人称代词</h3>
                  <table class="pronoun-declension-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>第一人称</th>
                        <th>第二人称</th>
                        <th>第三人称</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1格</td>
                        <td>я</td>
                        <td>ты</td>
                        <td>он / оно / она</td>
                      </tr>
                      <tr>
                        <td>2格</td>
                        <td>меня</td>
                        <td>тебя</td>
                        <td>его / её</td>
                      </tr>
                      <tr>
                        <td>3格</td>
                        <td>мне</td>
                        <td>тебе</td>
                        <td>ему / ей</td>
                      </tr>
                      <tr>
                        <td>4格</td>
                        <td>меня</td>
                        <td>тебя</td>
                        <td>его / её</td>
                      </tr>
                      <tr>
                        <td>5格</td>
                        <td>мной (мною)</td>
                        <td>тобой (тобою)</td>
                        <td>им / ей (ею)</td>
                      </tr>
                      <tr>
                        <td>6格</td>
                        <td>обо мне</td>
                        <td>о тебе</td>
                        <td>о нём / о ней</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div class="declension-table-section">
                  <h3>复数人称代词</h3>
                  <table class="pronoun-declension-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>第一人称</th>
                        <th>第二人称</th>
                        <th>第三人称</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1格</td>
                        <td>мы</td>
                        <td>вы</td>
                        <td>они</td>
                      </tr>
                      <tr>
                        <td>2格</td>
                        <td>нас</td>
                        <td>вас</td>
                        <td>их</td>
                      </tr>
                      <tr>
                        <td>3格</td>
                        <td>нам</td>
                        <td>вам</td>
                        <td>им</td>
                      </tr>
                      <tr>
                        <td>4格</td>
                        <td>нас</td>
                        <td>вас</td>
                        <td>их</td>
                      </tr>
                      <tr>
                        <td>5格</td>
                        <td>нами</td>
                        <td>вами</td>
                        <td>ими</td>
                      </tr>
                      <tr>
                        <td>6格</td>
                        <td>о нас</td>
                        <td>о вас</td>
                        <td>о них</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>
            
            <!-- 物主代词分类内容 -->
            <template v-else-if="selectedDesktopCategory === 'possessive-pronoun'">
              <div class="category-content">
                <h3>物主代词变格规则</h3>
                <div class="declension-table-section">
                  <h3>мой (我的)</h3>
                  <table class="possessive-pronoun-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>阳性</th>
                        <th>中性</th>
                        <th>阴性</th>
                        <th>复数</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>мой</td><td>моё</td><td>моя</td><td>мои</td></tr>
                      <tr><td>2格</td><td>моего</td><td>моего</td><td>моей</td><td>моих</td></tr>
                      <tr><td>3格</td><td>моему</td><td>моему</td><td>моей</td><td>моим</td></tr>
                      <tr><td>4格</td><td>мой/моего</td><td>моё</td><td>мою</td><td>мои/моих</td></tr>
                      <tr><td>5格</td><td>моим</td><td>моим</td><td>моей</td><td>моими</td></tr>
                      <tr><td>6格</td><td>моём</td><td>моём</td><td>моей</td><td>моих</td></tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>твой (你的)</h3>
                  <table class="possessive-pronoun-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>阳性</th>
                        <th>中性</th>
                        <th>阴性</th>
                        <th>复数</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>твой</td><td>твоё</td><td>твоя</td><td>твои</td></tr>
                      <tr><td>2格</td><td>твоего</td><td>твоего</td><td>твоей</td><td>твоих</td></tr>
                      <tr><td>3格</td><td>твоему</td><td>твоему</td><td>твоей</td><td>твоим</td></tr>
                      <tr><td>4格</td><td>твой/твоего</td><td>твоё</td><td>твою</td><td>твои/твоих</td></tr>
                      <tr><td>5格</td><td>твоим</td><td>твоим</td><td>твоей</td><td>твоими</td></tr>
                      <tr><td>6格</td><td>твоём</td><td>твоём</td><td>твоей</td><td>твоих</td></tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>свой (自己的)</h3>
                  <table class="possessive-pronoun-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>阳性</th>
                        <th>中性</th>
                        <th>阴性</th>
                        <th>复数</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>свой</td><td>своё</td><td>своя</td><td>свои</td></tr>
                      <tr><td>2格</td><td>своего</td><td>своего</td><td>своей</td><td>своих</td></tr>
                      <tr><td>3格</td><td>своему</td><td>своему</td><td>своей</td><td>своим</td></tr>
                      <tr><td>4格</td><td>свой/своего</td><td>своё</td><td>свою</td><td>свои/своих</td></tr>
                      <tr><td>5格</td><td>своим</td><td>своим</td><td>своей</td><td>своими</td></tr>
                      <tr><td>6格</td><td>своём</td><td>своём</td><td>своей</td><td>своих</td></tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>наш (我们的)</h3>
                  <table class="possessive-pronoun-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>阳性</th>
                        <th>中性</th>
                        <th>阴性</th>
                        <th>复数</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>наш</td><td>наше</td><td>наша</td><td>наши</td></tr>
                      <tr><td>2格</td><td>нашего</td><td>нашего</td><td>нашей</td><td>наших</td></tr>
                      <tr><td>3格</td><td>нашему</td><td>нашему</td><td>нашей</td><td>нашим</td></tr>
                      <tr><td>4格</td><td>наш/нашего</td><td>наше</td><td>нашу</td><td>наши/наших</td></tr>
                      <tr><td>5格</td><td>нашим</td><td>нашим</td><td>нашей</td><td>нашими</td></tr>
                      <tr><td>6格</td><td>нашем</td><td>нашем</td><td>нашей</td><td>наших</td></tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>ваш (你们的)</h3>
                  <table class="possessive-pronoun-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>阳性</th>
                        <th>中性</th>
                        <th>阴性</th>
                        <th>复数</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>ваш</td><td>ваше</td><td>ваша</td><td>ваши</td></tr>
                      <tr><td>2格</td><td>вашего</td><td>вашего</td><td>вашей</td><td>ваших</td></tr>
                      <tr><td>3格</td><td>вашему</td><td>вашему</td><td>вашей</td><td>вашим</td></tr>
                      <tr><td>4格</td><td>ваш/вашего</td><td>ваше</td><td>вашу</td><td>ваши/ваших</td></tr>
                      <tr><td>5格</td><td>вашим</td><td>вашим</td><td>вашей</td><td>вашими</td></tr>
                      <tr><td>6格</td><td>вашем</td><td>вашем</td><td>вашей</td><td>ваших</td></tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>его, её, их（不变格）</h3>
                  <table class="possessive-pronoun-table-simple">
                    <thead>
                      <tr>
                        <th>阳性</th>
                        <th>中性</th>
                        <th>阴性</th>
                        <th>复数</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>его</td><td>его</td><td>её</td><td>их</td></tr>
                    </tbody>
                  </table>
                </div>
                
                <div class="declension-table-section">
                  <h3>весь (全部的)</h3>
                  <table class="possessive-pronoun-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>阳性</th>
                        <th>中性</th>
                        <th>阴性</th>
                        <th>复数</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>весь</td><td>всё</td><td>вся</td><td>все</td></tr>
                      <tr><td>2格</td><td>всего</td><td>всего</td><td>всей</td><td>всех</td></tr>
                      <tr><td>3格</td><td>всему</td><td>всему</td><td>всей</td><td>всем</td></tr>
                      <tr><td>4格</td><td>весь/всего</td><td>всё</td><td>всю</td><td>все/всех</td></tr>
                      <tr><td>5格</td><td>всем</td><td>всем</td><td>всей</td><td>всеми</td></tr>
                      <tr><td>6格</td><td>всём</td><td>всём</td><td>всей</td><td>всех</td></tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>чей (谁的)</h3>
                  <table class="possessive-pronoun-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>阳性</th>
                        <th>中性</th>
                        <th>阴性</th>
                        <th>复数</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>чей</td><td>чьё</td><td>чья</td><td>чьи</td></tr>
                      <tr><td>2格</td><td>чьего</td><td>чьего</td><td>чьей</td><td>чьих</td></tr>
                      <tr><td>3格</td><td>чьему</td><td>чьему</td><td>чьей</td><td>чьим</td></tr>
                      <tr><td>4格</td><td>чей/чьего</td><td>чьё</td><td>чью</td><td>чьи/чьих</td></tr>
                      <tr><td>5格</td><td>чьим</td><td>чьим</td><td>чьей</td><td>чьими</td></tr>
                      <tr><td>6格</td><td>чьём</td><td>чьём</td><td>чьей</td><td>чьих</td></tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
                </div>
              </div>
            </template>
            
            <!-- 数词分类内容 -->
            <template v-else-if="selectedDesktopCategory === 'numeral'">
              <div class="category-content">
                <h3>数词变格规则</h3>
                
                <div class="declension-table-section">
                  <h3>数词+名词 变格规则</h3>
                  <p class="table-description">在俄语中，数词后面的名词不总是用1格复数形式，而是要根据数词的特定要求，使用单数或复数的特定"格"。</p>
                  <table class="declension-table">
                    <thead>
                      <tr>
                        <th>数词</th>
                        <th>名词格</th>
                        <th>示例</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1</td><td>单数第一格</td><td>один стол</td></tr>
                      <tr><td>2, 3, 4</td><td>单数第二格</td><td>два стола, три стола, четыре стола</td></tr>
                      <tr><td>5及以上</td><td>复数第二格</td><td>пять столов, шесть столов</td></tr>
                    </tbody>
                  </table>
                </div>
                
                <div class="declension-table-section">
                  <h3>数词变格规则</h3>
                  <div class="rule-text-left">
                    <p>1、一般情况下，与ночь（以ь结尾的阴性名词）的变格规则类似，但不区分单复数。</p>
                    <p>2、十位数、百位数、千位数等复合数词，前后都要变化。例如：двадцать пять（25），2/3/6格为двадцати пяти，5格为двадцатью пятью</p>
                    <p>3、тысяча (千)的变格规则类似книга，但不分单复数。</p>
                    <p>4、миллион / миллиард (百万/十亿)的变格规则类似стол，但不分单复数。</p>
                  </div>
                </div>
                
                <div class="declension-table-section">
                  <h3>数词特殊变格</h3>
                  <p class="table-description">1~4、8、40、90、100</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>один</h3>
                  <table class="declension-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>阳性</th>
                        <th>中性</th>
                        <th>阴性</th>
                        <th>复数</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>один</td><td>одно</td><td>одна</td><td>одни</td></tr>
                      <tr><td>2格</td><td>одного</td><td>одного</td><td>одной</td><td>одних</td></tr>
                      <tr><td>3格</td><td>одному</td><td>одному</td><td>одной</td><td>одним</td></tr>
                      <tr><td>4格</td><td>同1或2</td><td>одно</td><td>одну</td><td>同1或2</td></tr>
                      <tr><td>5格</td><td>одним</td><td>одним</td><td>одной</td><td>одними</td></tr>
                      <tr><td>6格</td><td>об одном</td><td>об одном</td><td>об одной</td><td>об одних</td></tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>два</h3>
                  <table class="declension-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>阳性 / 中性</th>
                        <th>阴性</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>два</td><td>две</td></tr>
                      <tr><td>2格</td><td>двух</td><td>двух</td></tr>
                      <tr><td>3格</td><td>двум</td><td>двум</td></tr>
                      <tr><td>4格</td><td>同1或2</td><td>同1或2</td></tr>
                      <tr><td>5格</td><td>двумя</td><td>двумя</td></tr>
                      <tr><td>6格</td><td>о двух</td><td>о двух</td></tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>три</h3>
                  <table class="declension-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>变化（不分性）</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>три</td></tr>
                      <tr><td>2格</td><td>трёх</td></tr>
                      <tr><td>3格</td><td>трём</td></tr>
                      <tr><td>4格</td><td>同1或2</td></tr>
                      <tr><td>5格</td><td>тремя</td></tr>
                      <tr><td>6格</td><td>о трёх</td></tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>четыре</h3>
                  <table class="declension-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>变化（不分性）</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>четыре</td></tr>
                      <tr><td>2格</td><td>четырех</td></tr>
                      <tr><td>3格</td><td>четырём</td></tr>
                      <tr><td>4格</td><td>同1或2</td></tr>
                      <tr><td>5格</td><td>четырьмя</td></tr>
                      <tr><td>6格</td><td>о четырёх</td></tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>восемь</h3>
                  <p class="table-description">восемь 变格时中间的 е 会脱落。</p>
                  <div class="rule-text">
                    <p>2/3/6格：восьми</p>
                    <p>5格：восемью 或 восьмью</p>
                  </div>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>сорок、девяносто、сто</h3>
                  <div class="rule-text">
                    <p>1/4格：原形</p>
                    <p>其他格：-а (сорока, девяноста, ста)</p>
                  </div>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
                </div>
              </div>
            </template>
            
            <!-- 其他分类内容 -->
            <template v-else-if="selectedDesktopCategory === 'other'">
              <div class="category-content">
                <h3>指示代词、疑问词、反身代词变格规则</h3>
                <div class="declension-table-section">
                  <h3>этот (这个)</h3>
                  <table class="other-pronoun-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>阳性</th>
                        <th>中性</th>
                        <th>阴性</th>
                        <th>复数</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>этот</td><td>это</td><td>эта</td><td>эти</td></tr>
                      <tr><td>2格</td><td>этого</td><td>этого</td><td>этой</td><td>этих</td></tr>
                      <tr><td>3格</td><td>этому</td><td>этому</td><td>этой</td><td>этим</td></tr>
                      <tr><td>4格</td><td>этот/этого</td><td>это</td><td>эту</td><td>эти/этих</td></tr>
                      <tr><td>5格</td><td>этим</td><td>этим</td><td>этой</td><td>этими</td></tr>
                      <tr><td>6格</td><td>этом</td><td>этом</td><td>этой</td><td>этих</td></tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>тот (那个)</h3>
                  <table class="other-pronoun-table">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>阳性</th>
                        <th>中性</th>
                        <th>阴性</th>
                        <th>复数</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>тот</td><td>то</td><td>та</td><td>те</td></tr>
                      <tr><td>2格</td><td>того</td><td>того</td><td>той</td><td>тех</td></tr>
                      <tr><td>3格</td><td>тому</td><td>тому</td><td>той</td><td>тем</td></tr>
                      <tr><td>4格</td><td>тот/того</td><td>то</td><td>ту</td><td>те/тех</td></tr>
                      <tr><td>5格</td><td>тем</td><td>тем</td><td>той</td><td>теми</td></tr>
                      <tr><td>6格</td><td>том</td><td>том</td><td>той</td><td>тех</td></tr>
                    </tbody>
                  </table>
                  <p class="table-note">修饰非动物名词时，4格形式等于1格；修饰动物名词时，4格形式等于2格</p>
                </div>
                
                <div class="declension-table-section">
                  <h3>кто (谁)</h3>
                  <table class="other-pronoun-table-simple">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>形式</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>кто</td></tr>
                      <tr><td>2格</td><td>кого</td></tr>
                      <tr><td>3格</td><td>кому</td></tr>
                      <tr><td>4格</td><td>кого</td></tr>
                      <tr><td>5格</td><td>кем</td></tr>
                      <tr><td>6格</td><td>ком</td></tr>
                    </tbody>
                  </table>
                </div>
                
                <div class="declension-table-section">
                  <h3>что (什么)</h3>
                  <table class="other-pronoun-table-simple">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>形式</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>что</td></tr>
                      <tr><td>2格</td><td>чего</td></tr>
                      <tr><td>3格</td><td>чему</td></tr>
                      <tr><td>4格</td><td>что</td></tr>
                      <tr><td>5格</td><td>чем</td></tr>
                      <tr><td>6格</td><td>чём</td></tr>
                    </tbody>
                  </table>
                </div>
                
                <div class="declension-table-section">
                  <h3>себя (反身代词)</h3>
                  <table class="other-pronoun-table-simple">
                    <thead>
                      <tr>
                        <th>格</th>
                        <th>形式</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>1格</td><td>—</td></tr>
                      <tr><td>2格</td><td>себя</td></tr>
                      <tr><td>3格</td><td>себе</td></tr>
                      <tr><td>4格</td><td>себя</td></tr>
                      <tr><td>5格</td><td>собой</td></tr>
                      <tr><td>6格</td><td>себе</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>
            
            <!-- 默认提示 -->
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

      <!-- 形容词和物主代词训练页面 -->
      <div v-else-if="currentPage === 'adj-training' || currentPage === 'poss-training'" class="page-content page-full-width">
        <!-- 形容词和物主代词训练的性别选择界面 -->
        <div v-if="adjPossTrainingState === 'select-gender'" class="case-select-container">
          <h2>{{ currentAdjPossType === 'adjective' ? '形容词训练' : '物主代词训练' }}</h2>
          <p class="instruction">请选择要训练的性：</p>
          <div class="case-buttons">
            <button 
              class="case-btn"
              @click="selectGender('阳性/中性')"
            >
              阳性/中性单数
            </button>
            <button 
              class="case-btn"
              @click="selectGender('阴性')"
            >
              阴性单数
            </button>
            <button 
              class="case-btn"
              @click="selectGender('复数')"
            >
              复数
            </button>
          </div>
        </div>
        <!-- 训练界面 -->
        <div v-else-if="adjPossTrainingState === 'practice'" class="practice-container">
          <div class="practice-header">
            <button class="back-btn" @click="backToGenderSelect">
              <ArrowLeft class="back-icon" />
            </button>
            <h2>{{ selectedGender }}</h2>
          </div>
          <div class="practice-content">
            <!-- 提示文字 -->
            <p class="hint-text">{{ currentAdjPossType === 'adjective' ? '点击高亮的形容词进行变格' : '点击高亮的物主代词进行变格' }}</p>
            
            <!-- 句子展示 -->
            <div class="sentence-container" v-if="currentAdjectiveSentence">
              <p class="sentence" v-html="adjectiveFullSentenceHtml" @click="handleAdjectiveSentenceClick($event)"></p>
              <!-- 词尾选择下拉菜单 -->
              <div 
                class="dropdown-container" 
                v-if="adjectiveShowDropdown && currentAdjectiveSentence" 
                :style="{ position: 'fixed', top: adjectiveDropdownTop + 'px', left: adjectiveDropdownLeft + 'px', zIndex: 1000 }"
              >
                <div class="dropdown">
                  <div 
                    v-for="(ending, index) in currentAdjectiveSentence.possibleEndings" 
                    :key="index"
                    class="dropdown-item"
                    @click="chooseAdjectiveEnding(ending)"
                  >
                    {{ ending }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 答案结果 -->
            <div class="result-container" v-if="adjectiveShowResult && currentAdjectiveSentence">
              <div class="result-icon" :class="adjectiveAnswerResult">
                {{ adjectiveAnswerResult === 'correct' ? '✔' : '❌' }}
              </div>
              <div class="result-message">
                <p v-if="adjectiveAnswerResult === 'correct'" class="correct-message">
                  正确！
                </p>
                <p v-else-if="adjectiveAnswerResult === 'incorrect'" class="incorrect-message">
                  错误！
                </p>
                <p class="explanation" v-if="adjectiveAnswerResult === 'incorrect'">
                  正确答案：
                  <span>{{ currentAdjectiveSentence.correctEnding === '/' ? currentAdjectiveSentence.targetWord : currentAdjectiveSentence.correctEnding }}</span>
                </p>
                <p class="explanation">
                  {{ currentAdjectiveSentence.explanation }}
                </p>
              </div>
              <button class="next-btn" @click="adjectiveNextQuestion">
                下一题
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 人称代词训练页面 -->
      <div v-else-if="currentPage === 'pronoun-training'" class="page-content page-full-width">
        <!-- 人称代词训练的人称选择界面 -->
        <div v-if="pronounTrainingState === 'select-person'" class="case-select-container">
          <h2>人称代词训练</h2>
          <p class="instruction">请选择要训练的人称：</p>
          <div class="case-buttons">
            <button 
              class="case-btn"
              @click="selectPerson('单数人称')"
            >
              单数人称
            </button>
            <button 
              class="case-btn"
              @click="selectPerson('复数人称')"
            >
              复数人称
            </button>
          </div>
        </div>
        <!-- 训练界面（后续实现） -->
        <div v-else-if="pronounTrainingState === 'practice'" class="practice-container">
          <div class="practice-header">
            <button class="back-btn" @click="backToPersonSelect">
              <ArrowLeft class="back-icon" />
            </button>
            <h2>{{ selectedPerson }}</h2>
          </div>
          <div class="practice-content">
            <p class="hint-text">点击高亮的人称代词进行变格</p>
            <div v-if="currentPersonalPronounSentence" class="sentence-container" @click="handlePersonalPronounSentenceClick">
              <p class="sentence" v-html="personalPronounFullSentenceHtml"></p>
              
              <!-- 下拉菜单 -->
              <div v-if="personalPronounShowDropdown" class="dropdown-container" :style="{ top: adjectiveDropdownTop + 'px', left: adjectiveDropdownLeft + 'px' }">
                <div class="dropdown">
                  <button 
                    v-for="(ending, index) in currentPersonalPronounSentence.possibleEndings" 
                    :key="index"
                    class="dropdown-item"
                    @click.stop="choosePersonalPronounEnding(ending)"
                  >
                    {{ ending }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 答案结果 -->
            <div v-if="personalPronounShowResult && currentPersonalPronounSentence" class="result-container">
              <div class="result-icon" :class="personalPronounAnswerResult">
                {{ personalPronounAnswerResult === 'correct' ? '✔' : '❌' }}
              </div>
              <div class="result-message">
                <p v-if="personalPronounAnswerResult === 'correct'" class="correct-message">
                  正确！
                </p>
                <p v-else-if="personalPronounAnswerResult === 'incorrect'" class="incorrect-message">
                  错误！
                </p>
                <p class="explanation" v-if="personalPronounAnswerResult === 'incorrect'">
                  正确答案：
                  <span>{{ currentPersonalPronounSentence.correctEnding }}</span>
                </p>
                <p class="explanation">
                  {{ currentPersonalPronounSentence.explanation }}
                </p>
              </div>
              <button class="next-btn" @click="personalPronounNextQuestion">
                下一题
              </button>
            </div>
            <p v-else-if="!currentPersonalPronounSentence" class="hint-text">加载中...</p>
          </div>
        </div>
      </div>

      <!-- 组合训练选择页面 -->
      <div v-else-if="currentPage === 'combined-training'" class="page-content page-full-width">
        <div class="case-select-container">
          <h2>组合训练</h2>
          <p class="instruction">请选择要训练的组合类型：</p>
          <div class="case-buttons">
            <button 
              class="case-btn"
              @click="navigateTo('adj-noun-combined')"
            >
              形容词+名词
            </button>
            <button 
              class="case-btn"
              @click="navigateTo('poss-noun-combined')"
            >
              物主代词+名词
            </button>
            <button 
              class="case-btn"
              @click="navigateTo('num-noun-combined')"
            >
              数词+名词
            </button>
          </div>
        </div>
      </div>

      <!-- 形容词+名词组合训练页面 -->
      <div v-else-if="currentPage === 'adj-noun-combined'" class="page-content page-full-width">
        <div class="practice-container">
          <div class="practice-header">
            <button class="back-btn" @click="navigateTo('combined-training')">
              <ArrowLeft class="back-icon" />
            </button>
            <h2>形容词+名词</h2>
          </div>
          <div class="practice-content">
            <!-- 要求信息 -->
            <div v-if="currentAdjNounSentence" class="hint-text">
              <p v-if="currentAdjNounSentence.number === '单数'">
                要求：将形容词和名词变为相应格的<strong class="highlight-number">单数形式</strong>
              </p>
              <p v-else>
                要求：将形容词和名词变为相应格的<strong class="highlight-number">复数形式</strong>
              </p>
            </div>
            
            <!-- 格筛选 -->
            <div v-if="currentAdjNounSentence" class="filter-container">
              <div class="filter-header" @click="adjNounShowFilterDropdown = !adjNounShowFilterDropdown">
                <span>题目类型：{{ adjNounCaseFilter === null ? '不限制' : '仅' + adjNounCaseFilter + '格' }}</span>
                <svg class="filter-icon" :class="{ rotated: adjNounShowFilterDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div v-if="adjNounShowFilterDropdown" class="filter-dropdown">
                <div class="filter-option" @click="adjNounCaseFilter = null; adjNounShowFilterDropdown = false; usedAdjNounSentences = []; loadAdjNounCombinedSentence()">
                  不限制
                </div>
                <div v-for="caseNum in [2, 3, 4, 5, 6]" :key="caseNum" class="filter-option" @click="adjNounCaseFilter = caseNum; adjNounShowFilterDropdown = false; usedAdjNounSentences = []; loadAdjNounCombinedSentence()">
                  仅{{ caseNum }}格
                </div>
              </div>
            </div>
            
            <div v-if="currentAdjNounSentence" class="sentence-container">
              <div class="sentence-content">
                <p class="sentence">
                  <template v-for="(part, index) in getAdjNounSentenceParts" :key="index">
                    <span v-if="part.type === 'text'">{{ part.content }}</span>
                    <span v-else-if="part.type === 'adjective'" 
                          class="target-word adj-noun-target adj-word" 
                          :class="{ 'selected': adjNounSelectedAdjective, 'has-blue-underline': adjNounSelectedAdjective }"
                          @click="handleAdjectiveClick($event)">
                      {{ adjNounSelectedAdjective || part.content }}
                    </span>
                    <span v-else-if="part.type === 'noun'" 
                          class="target-word adj-noun-target noun-word" 
                          :class="{ 'selected': adjNounSelectedNoun, 'has-red-underline': adjNounSelectedNoun }"
                          @click="handleNounClick($event)">
                      {{ adjNounSelectedNoun || part.content }}
                    </span>
                  </template>
                </p>
                
                <!-- 右侧提交按钮（仅电脑端） -->
                <div class="right-submit-btn-container">
                  <button v-if="!adjNounShowResult" class="desktop-submit-btn right-submit-btn" @click="checkAdjNounAnswer" :disabled="!adjNounSelectedAdjective || !adjNounSelectedNoun">
                    提交
                  </button>
                </div>
              </div>
              
              <!-- 形容词下拉菜单 -->
              <div v-if="adjNounShowDropdown === 'adjective'" 
                   class="dropdown-container" 
                   :style="{ top: adjNounDropdownTop + 'px', left: adjNounDropdownLeft + 'px' }">
                <div class="dropdown">
                  <button 
                    v-for="(option, index) in currentAdjNounSentence.adjectiveOptions" 
                    :key="index"
                    class="dropdown-item"
                    @click.stop="chooseAdjective(option)"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
              
              <!-- 名词下拉菜单 -->
              <div v-if="adjNounShowDropdown === 'noun'" 
                   class="dropdown-container" 
                   :style="{ top: adjNounDropdownTop + 'px', left: adjNounDropdownLeft + 'px' }">
                <div class="dropdown">
                  <button 
                    v-for="(option, index) in currentAdjNounSentence.nounOptions" 
                    :key="index"
                    class="dropdown-item"
                    @click.stop="chooseNoun(option)"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 提交按钮 -->
            <div v-if="currentAdjNounSentence && !adjNounShowResult" class="input-container">
              <button class="submit-btn" @click="checkAdjNounAnswer" :disabled="!adjNounSelectedAdjective || !adjNounSelectedNoun">
                提交
              </button>
            </div>
            
            <!-- 答案结果 -->
            <div v-if="adjNounShowResult && currentAdjNounSentence" class="result-container">
              <div class="result-icon" :class="adjNounAnswerResult">
                {{ adjNounAnswerResult === 'correct' ? '✔' : '❌' }}
              </div>
              <div class="result-message">
                <p v-if="adjNounAnswerResult === 'correct'" class="correct-message">
                  正确！
                </p>
                <p v-else-if="adjNounAnswerResult === 'incorrect'" class="incorrect-message">
                  错误！
                </p>
                <p class="explanation" v-if="adjNounAnswerResult === 'incorrect'">
                  正确答案：
                  <span>{{ currentAdjNounSentence.correctAnswer }}</span>
                </p>
                <p class="explanation">
                  {{ currentAdjNounSentence.explanation }}
                </p>
              </div>
              <button class="next-btn" @click="adjNounNextQuestion">
                下一题
              </button>
            </div>
            <p v-else-if="!currentAdjNounSentence" class="hint-text">加载中...</p>
          </div>
        </div>
      </div>

      <!-- 物主代词+名词组合训练页面 -->
      <div v-else-if="currentPage === 'poss-noun-combined'" class="page-content page-full-width">
        <div class="practice-container">
          <div class="practice-header">
            <button class="back-btn" @click="navigateTo('combined-training')">
              <ArrowLeft class="back-icon" />
            </button>
            <h2>物主代词+名词</h2>
          </div>
          <div class="practice-content">
            <!-- 要求信息 -->
            <div v-if="currentPossNounSentence" class="hint-text">
              <p v-if="currentPossNounSentence.number === '单数'">
                要求：将物主代词和名词变为相应格的<strong class="highlight-number">单数形式</strong>
              </p>
              <p v-else>
                要求：将物主代词和名词变为相应格的<strong class="highlight-number">复数形式</strong>
              </p>
            </div>
            
            <!-- 格筛选 -->
            <div v-if="currentPossNounSentence" class="filter-container">
              <div class="filter-header" @click="possNounShowFilterDropdown = !possNounShowFilterDropdown">
                <span>题目类型：{{ possNounCaseFilter === null ? '不限制' : '仅' + possNounCaseFilter + '格' }}</span>
                <svg class="filter-icon" :class="{ rotated: possNounShowFilterDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div v-if="possNounShowFilterDropdown" class="filter-dropdown">
                <div class="filter-option" @click="possNounCaseFilter = null; possNounShowFilterDropdown = false; usedPossNounSentences = []; loadPossNounCombinedSentence()">
                  不限制
                </div>
                <div v-for="caseNum in [2, 3, 4, 5, 6]" :key="caseNum" class="filter-option" @click="possNounCaseFilter = caseNum; possNounShowFilterDropdown = false; usedPossNounSentences = []; loadPossNounCombinedSentence()">
                  仅{{ caseNum }}格
                </div>
              </div>
            </div>
            
            <div v-if="currentPossNounSentence" class="sentence-container">
              <div class="sentence-content">
                <p class="sentence">
                  <template v-for="(part, index) in getPossNounSentenceParts" :key="index">
                    <span v-if="part.type === 'text'">{{ part.content }}</span>
                    <span v-else-if="part.type === 'pronoun'" 
                          class="target-word poss-noun-target pronoun-word" 
                          :class="{ 'selected': possNounSelectedPronoun, 'has-blue-underline': possNounSelectedPronoun }"
                          @click="handlePronounClick($event)">
                      {{ possNounSelectedPronoun || part.content }}
                    </span>
                    <span v-else-if="part.type === 'noun'" 
                          class="target-word poss-noun-target noun-word" 
                          :class="{ 'selected': possNounSelectedNoun, 'has-red-underline': possNounSelectedNoun }"
                          @click="handlePossNounClick($event)">
                      {{ possNounSelectedNoun || part.content }}
                    </span>
                  </template>
                </p>
                
                <!-- 右侧提交按钮（仅电脑端） -->
                <div class="right-submit-btn-container">
                  <button v-if="!possNounShowResult" class="desktop-submit-btn right-submit-btn" @click="checkPossNounAnswer" :disabled="!possNounSelectedPronoun || !possNounSelectedNoun">
                    提交
                  </button>
                </div>
              </div>
              
              <!-- 物主代词下拉菜单 -->
              <div v-if="possNounShowDropdown === 'pronoun'" 
                   class="dropdown-container" 
                   :style="{ top: possNounDropdownTop + 'px', left: possNounDropdownLeft + 'px' }">
                <div class="dropdown">
                  <button 
                    v-for="(option, index) in currentPossNounSentence.pronounOptions" 
                    :key="index"
                    class="dropdown-item"
                    @click.stop="choosePronoun(option)"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
              
              <!-- 名词下拉菜单 -->
              <div v-if="possNounShowDropdown === 'noun'" 
                   class="dropdown-container" 
                   :style="{ top: possNounDropdownTop + 'px', left: possNounDropdownLeft + 'px' }">
                <div class="dropdown">
                  <button 
                    v-for="(option, index) in currentPossNounSentence.nounOptions" 
                    :key="index"
                    class="dropdown-item"
                    @click.stop="choosePossNoun(option)"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 提交按钮 -->
            <div v-if="currentPossNounSentence && !possNounShowResult" class="input-container">
              <button class="submit-btn" @click="checkPossNounAnswer" :disabled="!possNounSelectedPronoun || !possNounSelectedNoun">
                提交
              </button>
            </div>
            
            <!-- 答案结果 -->
            <div v-if="possNounShowResult && currentPossNounSentence" class="result-container">
              <div class="result-icon" :class="possNounAnswerResult">
                {{ possNounAnswerResult === 'correct' ? '✔' : '❌' }}
              </div>
              <div class="result-message">
                <p v-if="possNounAnswerResult === 'correct'" class="correct-message">
                  正确！
                </p>
                <p v-else-if="possNounAnswerResult === 'incorrect'" class="incorrect-message">
                  错误！
                </p>
                <p class="explanation" v-if="possNounAnswerResult === 'incorrect'">
                  正确答案：
                  <span>{{ currentPossNounSentence.correctAnswer }}</span>
                </p>
                <p class="explanation">
                  {{ currentPossNounSentence.explanation }}
                </p>
              </div>
              <button class="next-btn" @click="possNounNextQuestion">
                下一题
              </button>
            </div>
            <p v-else-if="!currentPossNounSentence" class="hint-text">加载中...</p>
          </div>
        </div>
      </div>

      <!-- 数词+名词组合训练页面 -->
      <div v-else-if="currentPage === 'num-noun-combined'" class="page-content page-full-width">
        <div class="practice-container">
          <div class="practice-header">
            <button class="back-btn" @click="navigateTo('combined-training')">
              <ArrowLeft class="back-icon" />
            </button>
            <h2>数词+名词</h2>
          </div>
          <div class="practice-content">
            <!-- 要求信息 -->
            <div v-if="currentNumNounSentence" class="hint-text">
              <p v-if="currentNumNounSentence.number === '单数'">
                要求：将数词和名词变为相应格的<strong class="highlight-number">单数形式</strong>
              </p>
              <p v-else>
                要求：将数词和名词变为相应格的<strong class="highlight-number">复数形式</strong>
              </p>
            </div>
            
            <!-- 格筛选 -->
            <div v-if="currentNumNounSentence" class="filter-container">
              <div class="filter-header" @click="numNounShowFilterDropdown = !numNounShowFilterDropdown">
                <span>题目类型：{{ numNounCaseFilter === null ? '不限制' : '仅' + numNounCaseFilter + '格' }}</span>
                <svg class="filter-icon" :class="{ rotated: numNounShowFilterDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div v-if="numNounShowFilterDropdown" class="filter-dropdown">
                <div class="filter-option" @click="numNounCaseFilter = null; numNounShowFilterDropdown = false; usedNumNounSentences = []; loadNumNounCombinedSentence()">
                  不限制
                </div>
                <div v-for="caseNum in [2, 3, 4, 5, 6]" :key="caseNum" class="filter-option" @click="numNounCaseFilter = caseNum; numNounShowFilterDropdown = false; usedNumNounSentences = []; loadNumNounCombinedSentence()">
                  仅{{ caseNum }}格
                </div>
              </div>
            </div>
            
            <div v-if="currentNumNounSentence" class="sentence-container">
              <div class="sentence-content">
                <p class="sentence">
                  <template v-for="(part, index) in getNumNounSentenceParts" :key="index">
                    <span v-if="part.type === 'text'">{{ part.content }}</span>
                    <span v-else-if="part.type === 'numeral'" 
                          class="target-word num-noun-target numeral-word" 
                          :class="{ 'selected': numNounSelectedNumeral, 'has-blue-underline': numNounSelectedNumeral }"
                          @click="handleNumeralClick($event)">
                      {{ numNounSelectedNumeral || part.content }}
                    </span>
                    <span v-else-if="part.type === 'noun'" 
                          class="target-word num-noun-target noun-word" 
                          :class="{ 'selected': numNounSelectedNoun, 'has-red-underline': numNounSelectedNoun }"
                          @click="handleNumNounClick($event)">
                      {{ numNounSelectedNoun || part.content }}
                    </span>
                  </template>
                </p>
                
                <!-- 右侧提交按钮（仅电脑端） -->
                <div class="right-submit-btn-container">
                  <button v-if="!numNounShowResult" class="desktop-submit-btn right-submit-btn" @click="checkNumNounAnswer" :disabled="!numNounSelectedNumeral || !numNounSelectedNoun">
                    提交
                  </button>
                </div>
              </div>
              
              <!-- 数词下拉菜单 -->
              <div v-if="numNounShowDropdown === 'numeral'" 
                   class="dropdown-container" 
                   :style="{ top: numNounDropdownTop + 'px', left: numNounDropdownLeft + 'px' }">
                <div class="dropdown">
                  <button 
                    v-for="(option, index) in currentNumNounSentence.numeralOptions" 
                    :key="index"
                    class="dropdown-item"
                    @click.stop="chooseNumeral(option)"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
              
              <!-- 名词下拉菜单 -->
              <div v-if="numNounShowDropdown === 'noun'" 
                   class="dropdown-container" 
                   :style="{ top: numNounDropdownTop + 'px', left: numNounDropdownLeft + 'px' }">
                <div class="dropdown">
                  <button 
                    v-for="(option, index) in currentNumNounSentence.nounOptions" 
                    :key="index"
                    class="dropdown-item"
                    @click.stop="chooseNumNoun(option)"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 提交按钮 -->
            <div v-if="currentNumNounSentence && !numNounShowResult" class="input-container">
              <button class="submit-btn" @click="checkNumNounAnswer" :disabled="!numNounSelectedNumeral || !numNounSelectedNoun">
                提交
              </button>
            </div>
            
            <!-- 答案结果 -->
            <div v-if="numNounShowResult && currentNumNounSentence" class="result-container">
              <div class="result-icon" :class="numNounAnswerResult">
                {{ numNounAnswerResult === 'correct' ? '✔' : '❌' }}
              </div>
              <div class="result-message">
                <p v-if="numNounAnswerResult === 'correct'" class="correct-message">
                  正确！
                </p>
                <p v-else-if="numNounAnswerResult === 'incorrect'" class="incorrect-message">
                  错误！
                </p>
                <p class="explanation" v-if="numNounAnswerResult === 'incorrect'">
                  正确答案：
                  <span>{{ currentNumNounSentence.correctAnswer }}</span>
                </p>
                <p class="explanation">
                  {{ currentNumNounSentence.explanation }}
                </p>
              </div>
              <button class="next-btn" @click="numNounNextQuestion">
                下一题
              </button>
            </div>
            <p v-else-if="!currentNumNounSentence" class="hint-text">加载中...</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部栏 -->
    <!-- 底部栏已移除，使用侧边栏导航 -->
    
    <!-- 更新公告弹窗 -->
    <div v-if="showUpdateModal" class="update-modal-overlay">
      <div class="update-modal">
        <h3 class="update-modal-title">更新公告</h3>
        <div class="update-modal-content">
          <p>1、变格规则页面新增"数词"分类。</p>
          <p>2、移动端变格规则页面的分类导航栏现在可以滑动。</p>
          <p>3、组合训练新增“数词+名词训练”。</p>
          <p>4、组合训练新增筛选功能，可以限定格进行训练。</p>
        </div>
        <button class="update-modal-btn" @click="closeUpdateModal">我知道了</button>
      </div>
    </div>
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
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.header-nav {
  display: flex;
  gap: 0.5rem;
}

.header-nav-btn {
  padding: 0.5rem 1rem;
  border: none;
  background-color: white;
  color: #3498db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.header-nav-btn:hover {
  background-color: #e8f4fc;
}

.header-nav-btn.active {
  background-color: #3498db;
  color: white;
}

.main-title {
  font-size: 3rem;
  font-weight: 900;
  color: #000000;
  margin: 0;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.1rem;
  letter-spacing: 0.05em;
  font-family: "Bahnschrift", "Helvetica", sans-serif;
  transform: skewX(-12deg);
  line-height: 1;
  position: relative;
  cursor: pointer;
}

/* 苏联至上主义风格字母样式 */
.tech-letter {
  position: relative;
  display: inline-block;
  font-weight: 900;
  font-stretch: condensed;
  letter-spacing: -0.05em;
  transform: skewX(3deg);
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;
}

/* 蓝色部分样式 */
.tech-letter.blue-section {
  position: relative;
  color: #000000;
  transition: color 0.3s ease;
}

.tech-letter.blue-section::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: -5%;
  width: 110%;
  height: 3px;
  background-color: #3498db;
  opacity: var(--after-opacity, 1);
  transition: opacity 0.3s ease;
}



/* 红色部分样式 */
.tech-letter.red-section {
  position: relative;
  color: #000000;
  transition: color 0.3s ease;
}

.tech-letter.red-section::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: -5%;
  width: 110%;
  height: 3px;
  background-color: #e74c3c;
  opacity: var(--after-opacity, 1);
  transition: opacity 0.3s ease;
}





/* 蓝色点缀字母 - 苏联风格 */
.tech-letter.tech-blue {
  color: #000000;
  position: relative;
  transform: skewX(3deg);
}

/* 欢迎语样式 */
.welcome-message {
  text-align: center;
  font-size: 1rem;
  color: #999999;
  margin-bottom: 2rem;
  line-height: 1.4;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}



/* 内容区样式 */
.content {
  flex: 1;
  padding: 1rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* 移动端页面内容 */
@media (max-width: 768px) {
  .content {
    display: block;
  }
  
  .page-content {
    margin-bottom: 2rem;
  }
}

/* 主页内容 */
.home-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  align-items: center;
  justify-items: center;
  padding: 1rem;
}

/* 欢迎语容器 */
.welcome-message {
  grid-column: 1 / -1;
  margin-bottom: 1rem;
}

/* 移动端欢迎语上方留白 */
@media (max-width: 768px) {
  .welcome-message {
    margin-top: 1.5rem;
  }
}

/* 训练按钮样式 */
.training-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: #ffffff;
  color: #3498db;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.04), -3px -3px 6px rgba(255, 255, 255, 0.9);
  text-align: center;
  min-width: 100px;
  max-width: 120px;
  height: 120px;
  margin: 0.4rem;
  position: relative;
  overflow: hidden;
}

.training-btn:hover {
  background: #ffffff;
  border-color: #d4e6f1;
  transform: translateY(-4px) scale(1.03);
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.06), -5px -5px 10px rgba(255, 255, 255, 0.95);
}

.training-btn:active {
  transform: translateY(0) scale(0.97);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.04), -2px -2px 4px rgba(255, 255, 255, 0.85);
}

/* 按钮图标 */
.training-btn .btn-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 0.6rem;
  display: block;
  color: #3498db;
  transition: all 0.3s ease;
}

.training-btn:hover .btn-icon {
  transform: scale(1.1);
}

/* 按钮文字 */
.training-btn .btn-text {
  font-size: 0.85rem;
  line-height: 1.2;
  text-align: center;
  color: #3498db;
  margin-top: 0.4rem;
  transition: all 0.3s ease;
}

.training-btn:hover .btn-text {
  color: #3498db;
}



/* 响应式设计 */
@media (max-width: 1200px) {
  /* 小屏幕标题大小 */
  .main-title {
    font-size: 2.5rem;
  }
  
  /* 移动端标题样式 */
  .tech-letter.blue-section {
    color: #000000;
  }
  
  .tech-letter.red-section {
    color: #000000;
  }
  
  .tech-letter.blue-section::after,
  .tech-letter.red-section::after {
    display: block;
    opacity: 1 !important;
  }
  
  .tech-letter.blue-section:hover,
  .tech-letter.red-section:hover {
    color: inherit;
  }
}

@media (max-width: 767px) {
  /* 移动端标题大小 */
  .main-title {
    font-size: 2.5rem;
  }
  
  .home-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
    padding: 0.8rem;
    justify-items: center;
    align-items: center;
  }
  
  .training-btn {
    width: 90px;
    height: 110px;
    padding: 0.8rem 0.6rem;
    margin: 0;
    flex: none;
    background: linear-gradient(145deg, #ffffff, #f8f9fa);
    color: #3498db;
    border: 1px solid #e8e8e8;
    box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.04), -3px -3px 6px rgba(255, 255, 255, 0.9);
  }
  
  .training-btn .btn-icon {
    width: 28px;
    height: 28px;
    margin-bottom: 0.4rem;
    color: #3498db;
  }
  
  .training-btn .btn-text {
    font-size: 0.8rem;
    margin-top: 0.4rem;
    color: #3498db;
  }
  
  .training-btn:hover {
    background: linear-gradient(145deg, #ffffff, #f8f9fa);
    border-color: #e8e8e8;
    transform: none;
    box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.04), -3px -3px 6px rgba(255, 255, 255, 0.9);
  }
  
  .training-btn:active {
    transform: none;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.04), -2px -2px 4px rgba(255, 255, 255, 0.9);
  }
  
  .training-btn:hover .btn-icon {
    transform: none;
  }
  
  .training-btn:hover .btn-text {
    color: #3498db;
  }
}

/* 小屏幕设备 */
@media (max-width: 360px) {
  .home-content {
    gap: 0.6rem;
    padding: 0.6rem;
  }
  
  .training-btn {
    width: 80px;
    height: 100px;
    padding: 0.6rem 0.4rem;
    background: linear-gradient(145deg, #ffffff, #f8f9fa);
    color: #3498db;
    border: 1px solid #e8e8e8;
    box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.04), -3px -3px 6px rgba(255, 255, 255, 0.9);
  }
  
  .training-btn .btn-icon {
    width: 26px;
    height: 26px;
    margin-bottom: 0.3rem;
    color: #3498db;
  }
  
  .training-btn .btn-text {
    font-size: 0.75rem;
    color: #3498db;
  }
  
  .training-btn:hover {
    background: linear-gradient(145deg, #ffffff, #f8f9fa);
    border-color: #e8e8e8;
    transform: none;
    box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.08), -6px -6px 12px rgba(255, 255, 255, 0.9);
  }
  
  .training-btn:active {
    transform: none;
    box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.08), -6px -6px 12px rgba(255, 255, 255, 0.9);
  }
  
  .training-btn:hover .btn-icon {
    transform: none;
  }
  
  .training-btn:hover .btn-text {
    color: #3498db;
  }
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

/* 规则文本样式 */
.rule-text {
  padding: 0;
  margin: 10px 0;
}

.rule-text p {
  margin: 8px 0;
  text-align: center;
  color: black !important;
  line-height: 1.4;
}

.rule-text-left {
  padding: 0;
  margin: 10px 0;
}

.rule-text-left p {
  margin: 8px 0;
  text-align: left;
  line-height: 1.4;
}

/* 分类导航条样式 */
.rules-category-nav {
  margin: 20px 0;
  background-color: white;
  overflow: hidden;
  width: 100%;
  border-bottom: solid 1px #efefef;
  padding-bottom: 8px;
}

.category-scroll {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  gap: 0;
  padding: 0 10px;
  width: 100%;
  justify-content: space-between;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-btn {
  flex: 0 1 auto;
  min-width: 0;
  padding: 12px 10px;
  background-color: transparent;
  border: none;
  border-radius: 0;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  transition: none;
  position: relative;
  white-space: nowrap;
  text-align: center;
}

.category-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 60%;
  height: 3px;
  background-color: #3498db;
  transition: transform 0.2s ease;
}

.category-btn.active {
  color: #3498db;
  font-weight: bold;
}

.category-btn.active::after {
  transform: translateX(-50%) scaleX(1);
}

/* 占位内容样式 */
.placeholder-content {
  padding: 40px 20px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 20px;
}

.placeholder-text {
  color: #999;
  font-size: 1.1rem;
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

.case-auxiliary {
  margin-bottom: 15px;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.case-auxiliary h4 {
  margin-bottom: 8px;
  color: #34495e;
  font-size: 0.95rem;
}

.auxiliary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.auxiliary-table tr {
  border-bottom: 1px solid #e0e0e0;
}

.auxiliary-table tr:last-child {
  border-bottom: none;
}

.auxiliary-category {
  width: 80px;
  padding: 6px 8px;
  color: #7f8c8d;
  font-weight: 500;
  vertical-align: middle;
}

.auxiliary-words {
  padding: 6px 8px;
  color: #2c3e50;
  line-height: 1.4;
  text-align: left;
  font-size: 0.8rem;
  word-wrap: break-word;
  word-break: break-word;
}

.auxiliary-section {
  margin-bottom: 10px;
}

.auxiliary-section:last-child {
  margin-bottom: 0;
}

.auxiliary-section h5 {
  margin-bottom: 5px;
  color: #7f8c8d;
  font-size: 0.85rem;
}

.auxiliary-section ul {
  margin: 0;
  padding-left: 20px;
}

.auxiliary-section li {
  margin-bottom: 4px;
  color: #2c3e50;
  font-size: 0.85rem;
  line-height: 1.5;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background-color: #ecf0f1;
  color: #2c3e50;
}

/* 为back-btn内的图标添加样式 */
.back-btn .back-icon {
  font-size: 1rem;
  width: 20px;
  height: 20px;
  display: inline-block;
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
  white-space: nowrap;
}

.practice-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.practice-content::-webkit-scrollbar {
  display: none;
}

/* 筛选条样式 */
.filter-container {
  position: relative;
  margin-bottom: 0.5rem;
}

.filter-header {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  color: #666;
  position: relative;
}

.filter-header span {
  flex: 1;
  text-align: center;
}

.filter-icon {
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.filter-header:hover {
  background-color: #f8f9fa;
}

.filter-icon {
  width: 12px;
  height: 12px;
  transition: transform 0.2s ease;
}

.filter-icon.rotated {
  transform: rotate(180deg);
}

.filter-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 1px;
}

.filter-option {
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.8rem;
  color: #666;
}

.filter-option:hover {
  background-color: #f8f9fa;
}

.sentence-container {
  background-color: white;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

/* 句子内容容器 */
.sentence-content {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

/* 右侧提交按钮容器 */
.right-submit-btn-container {
  display: none;
}

/* 右侧提交按钮 */
.right-submit-btn {
  padding: 0.5rem;
  font-size: 0.8rem;
}

/* 电脑端样式 */
@media (min-width: 769px) {
  .right-submit-btn-container {
    display: block;
    position: absolute;
    right: 13%;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
  }
  
  .page-full-width .practice-content .input-container {
    display: none;
  }
  
  .desktop-submit-btn.right-submit-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    min-width: auto;
  }
  
  .sentence {
    text-align: center;
    margin: 0 auto;
  }

  .header {
    padding: 1rem 2rem;
    justify-content: space-between;
  }

  .main-title {
    font-size: 2.5rem;
    margin-left: 3rem;
  }

  .header-nav {
    display: flex;
  }

  .footer {
    display: none;
  }

  .declension-rules-desktop .declension-table {
    font-size: 0.9rem;
  }

  .declension-rules-desktop .declension-table th,
  .declension-rules-desktop .declension-table td {
    padding: 8px 12px;
  }

  /* 数词+名词变格规则电脑端样式 */
  .declension-rules-desktop .declension-table-section:nth-child(1) .table-description {
    font-size: 0.95rem;
    line-height: 1.8;
    text-align: left;
    padding: 0.5rem 0;
    margin-bottom: 0.8rem;
  }

  .declension-rules-desktop .declension-table-section:nth-child(1) .declension-table {
    font-size: 0.9rem;
    width: 100%;
    overflow-x: visible;
  }

  .declension-rules-desktop .declension-table-section:nth-child(1) .declension-table th,
  .declension-rules-desktop .declension-table-section:nth-child(1) .declension-table td {
    padding: 10px 15px;
  }

  .declension-rules-desktop .table-note {
    font-size: 0.85rem;
  }

  .declension-rules-desktop .pronoun-declension-table,
  .declension-rules-desktop .possessive-pronoun-table,
  .declension-rules-desktop .possessive-pronoun-table-simple,
  .declension-rules-desktop .other-pronoun-table,
  .declension-rules-desktop .other-pronoun-table-simple {
    font-size: 0.9rem;
  }

  .declension-rules-desktop .pronoun-declension-table th,
  .declension-rules-desktop .pronoun-declension-table td,
  .declension-rules-desktop .possessive-pronoun-table th,
  .declension-rules-desktop .possessive-pronoun-table td,
  .declension-rules-desktop .possessive-pronoun-table-simple th,
  .declension-rules-desktop .possessive-pronoun-table-simple td,
  .declension-rules-desktop .other-pronoun-table th,
  .declension-rules-desktop .other-pronoun-table td,
  .declension-rules-desktop .other-pronoun-table-simple th,
  .declension-rules-desktop .other-pronoun-table-simple td {
    padding: 8px 12px;
  }
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

/* 目标词样式 */
.target-word {
  color: #3498db;
  font-weight: bold;
  cursor: pointer;
  position: relative;
}

.target-word:hover {
  color: #2980b9;
}

/* 形容词+名词训练目标词样式 */
.adj-noun-target {
  color: #000000;
  font-weight: bold;
  cursor: pointer;
  position: relative;
  padding: 0 2px;
}

.adj-noun-target:hover {
  background-color: #f0f0f0;
}

/* 物主代词+名词训练目标词样式 */
.poss-noun-target {
  color: #000000;
  font-weight: bold;
  cursor: pointer;
  position: relative;
  padding: 0 2px;
}

.poss-noun-target:hover {
  background-color: #f0f0f0;
}

/* 数词+名词训练目标词样式 */
.num-noun-target {
  color: #000000;
  font-weight: bold;
  cursor: pointer;
  position: relative;
  padding: 0 2px;
}

.num-noun-target:hover {
  background-color: #f0f0f0;
}

/* 形容词蓝色下划线 */
.has-blue-underline {
  border-bottom: 2px solid #3498db;
}

/* 名词红色下划线 */
.has-red-underline {
  border-bottom: 2px solid #e74c3c;
}

/* 高亮数字样式 */
.highlight-number {
  color: #f29620;
  font-weight: bold;
}

/* 移动端高亮数字换行 */
@media (max-width: 768px) {
  .highlight-number {
    display: inline-block;
  }
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
.submit-btn, .desktop-submit-btn {
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

.submit-btn:hover:not(:disabled), .desktop-submit-btn:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.4);
}

.submit-btn:disabled, .desktop-submit-btn:disabled {
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

.question-number-tag {
  font-size: 0.9rem;
  color: #f29620;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
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
    font-size: 3rem;
    gap: 0.1rem;
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

  /* 变格规则和训练历史页面 - 卡片样式 */
  .content:has(.declension-rules-desktop),
  .content:has(.history-page) {
    padding: 0;
    justify-content: flex-start;
    margin: 1rem;
    border-radius: 8px;
    background-color: #ffffff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    max-width: none;
    width: auto;
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
    padding: 1.5rem 2rem;
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
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    padding: 0;
  }

  .page-full-width .case-btn {
    flex: 0 0 auto;
    min-width: 120px;
  }

  .page-full-width .case-select-container {
    justify-content: center;
    align-items: center;
    text-align: center;
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
    padding: 2.8rem;
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
    font-size: 1rem;
    line-height: 1.5;
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
    padding: 1rem 0;
    flex-shrink: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    scrollbar-width: thin;
  }

  .declension-rules-desktop .rules-sidebar::-webkit-scrollbar {
    width: 4px;
  }

  .declension-rules-desktop .rules-sidebar::-webkit-scrollbar-track {
    border-radius: 10px;
  }

  .declension-rules-desktop .rules-sidebar::-webkit-scrollbar-thumb {
    border-radius: 10px;
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
    padding: 1.5rem 2rem;
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
    font-size: 3rem;
  }

  /* 主页样式 */
  .home-content {
    gap: 2rem;
  }

  .training-btn {
    padding: 1rem 2.5rem;
    font-size: 1.15rem;
    height: 150px;
  }

  .training-btn .btn-icon {
    width: 40px;
    height: 40px;
    margin-bottom: 0.5rem;
  }

  .training-btn .btn-text {
    font-size: 1rem;
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
    padding: 1rem 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    scrollbar-width: thin;
  }

  .declension-rules-desktop .rules-sidebar::-webkit-scrollbar {
    width: 4px;
  }

  .declension-rules-desktop .rules-sidebar::-webkit-scrollbar-track {
    border-radius: 10px;
  }

  .declension-rules-desktop .rules-sidebar::-webkit-scrollbar-thumb {
    border-radius: 10px;
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
    padding: 1.5rem 2rem;
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

  /* 电脑端变格规则页面表格小标题去掉横线 */
  .declension-rules-desktop .declension-table-section h3 {
    border-bottom: none;
    padding-bottom: 0;
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
    padding: 1.5rem 1rem 1.5rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
  }

  /* 移动端主内容区域添加顶部间距，避免被固定头部遮挡 */
  .content {
    margin-top: 80px;
  }
  
  .main-title {
    font-size: 1.6rem;
    gap: 0.05rem;
    transform: skewX(-10deg);
  }
  
  .tech-letter {
    font-size: 1.6rem;
    letter-spacing: -0.03em;
  }
  
  .tech-letter.tech-blue {
    transform: skewX(3deg);
  }
  
  /* 移动端欢迎语样式 */
  .welcome-message {
    font-size: 0.8rem;
    margin-bottom: 2.5rem;
    padding: 0 1rem;
  }
  
  /* 内容样式 */
  .content {
    padding: 1rem;
  }
  
  /* 页面内容样式 */
  .page-content {
    padding: 1rem;
  }
  
  /* 数词分类规则变格移动端样式 */
  .numeral-rules .table-description {
    font-size: 0.8rem;
    line-height: 2;
    text-align: left;
    padding: 0.2rem 0.5rem;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  
  /* 数词+名词变格规则样式 */
  .numeral-category .declension-table-section:nth-child(1) .table-description {
    font-size: 0.8rem;
    line-height: 1.6;
    text-align: left;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  
  .numeral-category .declension-table-section:nth-child(1) .declension-table {
    font-size: 0.75rem;
    width: 100%;
    overflow-x: auto;
  }
  
  .numeral-category .declension-table-section:nth-child(1) .declension-table th,
  .numeral-category .declension-table-section:nth-child(1) .declension-table td {
    padding: 0.3rem 0.5rem;
    text-align: center;
    white-space: nowrap;
  }
  
  .rule-text {
    font-size: 0.8rem;
    line-height: 1.5;
  }
  
  /* 分类导航栏按钮间距 */
  .category-btn {
    padding: 12px 10px !important;
    font-size: 0.9rem !important;
    white-space: nowrap !important;
    flex: 0 0 auto !important;
  }
  
  .category-scroll {
    gap: 0 !important;
    justify-content: flex-start !important;
    flex-wrap: nowrap !important;
    padding: 0 !important;
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

  /* 移动端菜单按钮 */
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
  }

  .menu-icon {
    width: 20px;
    height: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;
  }

  .menu-icon span {
    display: block;
    width: 100%;
    height: 3px;
    background-color: #666666;
    border-radius: 2px;
  }

  /* 移动端侧边栏遮罩 */
  .mobile-sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 100;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }

  .mobile-sidebar-overlay.overlay-visible {
    opacity: 1;
    visibility: visible;
  }

  /* 移动端侧边栏 */
  .mobile-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 250px;
    height: 100vh;
    background-color: #ffffff;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    z-index: 101;
    display: flex;
    flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .mobile-sidebar.sidebar-open {
    transform: translateX(0);
  }

  .mobile-sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e0e0e0;
  }

  .mobile-sidebar-header h3 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.1rem;
  }

  .mobile-sidebar-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #7f8c8d;
    cursor: pointer;
    padding: 0.2rem 0.5rem;
  }

  .mobile-sidebar-nav {
    display: flex;
    flex-direction: column;
    padding: 1rem 0;
  }

  .mobile-sidebar-btn {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem 1.5rem;
    background: none;
    border: none;
    color: #2c3e50;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
  }

  .mobile-sidebar-btn.active {
    background-color: #e8f4fc;
    color: #3498db;
  }

  .mobile-sidebar-btn:hover {
    background-color: #f5f7fa;
  }

  .mobile-sidebar-icon {
    width: 20px;
    height: 20px;
    color: #3498db;
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
  min-width: 180px;
  padding-right: 1rem;
  border-right: 1px solid #e0e0e0;
}

.category-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-main-btn {
  padding: 0.5rem 0.8rem;
  border: none;
  background-color: white;
  color: #3498db;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background-color 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  width: 90%;
}

.category-main-btn:hover {
  background-color: #e8f4fc;
}

.category-main-btn.active:not(.noun-category) {
  background-color: #3498db;
  color: white;
}

.category-main-btn.noun-category.active {
  background-color: white;
  color: #3498db;
}

.category-main-btn .expand-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.category-main-btn .expand-icon.expanded {
  transform: rotate(180deg);
}

.category-sub-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 0;
  margin-top: 0.5rem;
  width: 90%;
}

.case-sidebar-btn {
  padding: 0.4rem 0.8rem;
  border: none;
  background-color: white;
  color: #3498db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.3s ease;
  width: 100%;
  text-align: left;
}

.case-sidebar-btn:hover {
  background-color: #e8f4fc;
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

.category-content {
  padding: 1rem;
}

.category-content h3 {
  color: #3498db;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #3498db;
}

.category-content p {
  color: #7f8c8d;
  line-height: 1.6;
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


.declension-table-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow-x: hidden;
  max-width: 100%;
}

.declension-table-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.declension-table-section h3 {
  color: #3498db;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  padding-bottom: 0.5rem;
}

.table-description {
  color: #7f8c8d;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 0.9rem;
}

.table-description-list {
  color: #7f8c8d;
  margin: 0 0 1.2rem 1.5rem;
  line-height: 1.5;
  font-size: 0.9rem;
}

.table-description-list li {
  margin-bottom: 0.5rem;
}

.table-note {
  color: #7f8c8d;
  margin-top: 0.8rem;
  font-size: 0.6rem;
  line-height: 1.4;
  font-style: italic;
  text-align: left;
  padding: 0 0.5rem;
  border-top: 1px dashed #e0e0e0;
  padding-top: 0.8rem;
}

/* 人称代词表格样式 */
.pronoun-declension-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.65rem;
  overflow-x: hidden;
  display: table;
  max-width: 100%;
  table-layout: fixed;
}

.pronoun-declension-table thead {
  background-color: #f8f9fa;
  border-bottom: 2px solid #3498db;
}

.pronoun-declension-table tbody {
  display: table-row-group;
}

.pronoun-declension-table th,
.pronoun-declension-table td {
  padding: 3px 4px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
  font-family: 'Arial', sans-serif;
  overflow: visible;
  text-overflow: clip;
  line-height: 1.2;
}

.pronoun-declension-table th:first-child,
.pronoun-declension-table td:first-child {
  width: 30px;
}

.pronoun-declension-table th:not(:first-child),
.pronoun-declension-table td:not(:first-child) {
  width: calc((100% - 30px) / 3);
}

/* 物主代词表格样式 */
.possessive-pronoun-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.65rem;
  overflow-x: hidden;
  display: table;
  max-width: 100%;
  table-layout: fixed;
}

.possessive-pronoun-table thead {
  background-color: #f8f9fa;
  border-bottom: 2px solid #3498db;
}

.possessive-pronoun-table tbody {
  display: table-row-group;
}

.possessive-pronoun-table th,
.possessive-pronoun-table td {
  padding: 3px 4px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
  font-family: 'Arial', sans-serif;
  overflow: visible;
  text-overflow: clip;
  line-height: 1.2;
}

.possessive-pronoun-table th:first-child,
.possessive-pronoun-table td:first-child {
  width: 30px;
}

.possessive-pronoun-table th:not(:first-child),
.possessive-pronoun-table td:not(:first-child) {
  width: calc((100% - 30px) / 4);
}

/* 简化的物主代词表格样式 */
.possessive-pronoun-table-simple {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.65rem;
  overflow-x: hidden;
  display: table;
  max-width: 100%;
  table-layout: fixed;
}

.possessive-pronoun-table-simple thead {
  background-color: #f8f9fa;
  border-bottom: 2px solid #3498db;
}

.possessive-pronoun-table-simple th,
.possessive-pronoun-table-simple td {
  padding: 3px 4px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
  font-family: 'Arial', sans-serif;
  overflow: visible;
  text-overflow: clip;
  line-height: 1.2;
  width: 25%;
}

/* 其他代词表格样式 */
.other-pronoun-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.65rem;
  overflow-x: hidden;
  display: table;
  max-width: 100%;
  table-layout: fixed;
}

.other-pronoun-table thead {
  background-color: #f8f9fa;
  border-bottom: 2px solid #3498db;
}

.other-pronoun-table th,
.other-pronoun-table td {
  padding: 3px 4px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
  font-family: 'Arial', sans-serif;
  overflow: visible;
  text-overflow: clip;
  line-height: 1.2;
}

.other-pronoun-table th:first-child,
.other-pronoun-table td:first-child {
  width: 30px;
}

.other-pronoun-table th:not(:first-child),
.other-pronoun-table td:not(:first-child) {
  width: calc((100% - 30px) / 4);
}

/* 简化的其他代词表格样式 */
.other-pronoun-table-simple {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.65rem;
  overflow-x: hidden;
  display: table;
  max-width: 100%;
  table-layout: fixed;
}

.other-pronoun-table-simple thead {
  background-color: #f8f9fa;
  border-bottom: 2px solid #3498db;
}

.other-pronoun-table-simple th,
.other-pronoun-table-simple td {
  padding: 3px 4px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
  font-family: 'Arial', sans-serif;
  overflow: visible;
  text-overflow: clip;
  line-height: 1.2;
}

.other-pronoun-table-simple th:first-child,
.other-pronoun-table-simple td:first-child {
  width: 30px;
}

.other-pronoun-table-simple th:not(:first-child),
.other-pronoun-table-simple td:not(:first-child) {
  width: calc(100% - 30px);
}

/* 变格表格样式 */
.declension-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.6rem;
  overflow-x: hidden;
  display: table;
  max-width: 100%;
  table-layout: fixed;
}

.declension-table thead {
  background-color: #f8f9fa;
  border-bottom: 2px solid #3498db;
}

.declension-table tbody {
  display: table-row-group;
}

.declension-table th,
.declension-table td {
  padding: 3px 4px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
  font-family: 'Arial', sans-serif;
  overflow: visible;
  text-overflow: clip;
  line-height: 1.2;
}

.declension-table th:first-child,
.declension-table td:first-child {
  width: 30px;
}

.declension-table th:not(:first-child),
.declension-table td:not(:first-child) {
  width: calc((100% - 30px) / 4);
}

/* 确保表格容器不超出内容框 */
.declension-table-section {
  overflow-x: hidden;
  max-width: 100%;
}

.declension-table th {
  font-weight: 600;
  color: #34495e;
}

.declension-table tr:hover {
  background-color: #f8f9fa;
}

.declension-table tr:nth-child(even) {
  background-color: #fafafa;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .declension-table {
    font-size: 0.6rem;
  }
  
  .declension-table th,
  .declension-table td {
    padding: 3px 4px;
  }
  
  .declension-table-section {
    padding: 0.5rem;
  }

  /* 移动端变格规则页面标题居中 */
  .page-full-width h2 {
    text-align: center;
  }

  .page-full-width .instruction {
    text-align: center;
  }
  
  /* 移动端形容词硬变化栏目样式 */
  .adjective-hard-change .table-description {
    text-align: center;
    font-size: 0.9rem;
  }
  
  /* 移动端形容词软变化栏目样式 */
  .adjective-soft-change .table-description {
    text-align: center;
    font-size: 0.9rem;
  }
  
  /* 移动端筛选条样式调整 */
  .filter-container {
    margin-bottom: 0.3rem;
    margin-top: 0;
  }
  
  .filter-header {
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
  }
  

  
  /* 移动端组合训练页面紧凑布局 */
  .word-selection {
    margin: 0.3rem 0;
  }
  
  .target-word-container {
    padding: 0.5rem;
  }
  
  .target-word-base {
    font-size: 1rem;
  }
  
  .current-ending {
    font-size: 1rem;
  }
  
  /* 移动端结果容器更紧凑 */
  .result-container {
    padding: 0.8rem;
    gap: 0.5rem;
  }
  
  .result-icon {
    font-size: 1.3rem;
    width: 40px;
    height: 40px;
    margin-bottom: 0.2rem;
  }
  
  .correct-message,
  .incorrect-message {
    font-size: 0.9rem;
    margin: 0 0 0.3rem 0;
  }
  
  .explanation {
    font-size: 0.8rem;
    line-height: 1.3;
    margin: 0.2rem 0;
  }
  
  .next-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    margin-top: 0.3rem;
  }
}

/* 更新公告弹窗样式 */
.update-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.update-modal {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 90%;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.update-modal-title {
  text-align: center;
  color: #3498db;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  font-weight: bold;
}

.update-modal-content {
  margin-bottom: 1.5rem;
}

.update-modal-content p {
  text-align: left;
  margin: 0.5rem 0;
  line-height: 1.4;
}

.update-modal-btn {
  display: block;
  width: 100%;
  padding: 0.8rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.update-modal-btn:hover {
  background-color: #2980b9;
}

/* 移动端更新公告弹窗样式 */
@media (max-width: 768px) {
  .update-modal {
    padding: 1.5rem;
    width: 90%;
  }
  
  .update-modal-title {
    font-size: 1.1rem;
    margin-bottom: 1.2rem;
  }
  
  .update-modal-content p {
    font-size: 0.9rem;
  }
  
  .update-modal-btn {
    padding: 0.7rem;
    font-size: 0.9rem;
  }
}
</style>