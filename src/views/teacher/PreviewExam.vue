<template>
  <div class="preview-exam">
    <h2>试卷预览：{{ exam.taskCode }}（{{ modeLabel[exam.mode] || '未知模式' }}）</h2>

    <!-- 选择题部分 -->
    <div v-if="mcQuestions.length > 0" class="question-section">
      <h3>选择题</h3>
      <div v-for="(q, i) in mcQuestions" :key="'mc-' + i" class="question-item">
        <div class="question-number">{{ i + 1 }}.</div>
        <div class="question-content">
          <p class="question-text">{{ getQuestionText(q) }}</p>
          <!-- 显示选项 -->
          <div v-if="getQuestionOptions(q).length > 0" class="options">
            <div v-for="(option, optIndex) in getQuestionOptions(q)" :key="optIndex" class="option">
              {{ getOptionLabel(optIndex) }}. {{ getOptionText(option) }}
            </div>
          </div>
          <div v-else-if="q.type === 'JUDGE'" class="options">
            <div class="option">A. 正确</div>
            <div class="option">B. 错误</div>
          </div>
          <div v-if="q.difficulty" class="question-difficulty">难度：{{ q.difficulty }}</div>
        </div>
      </div>
    </div>
    <div v-else class="no-questions">暂无选择题</div>

    <!-- 问答题部分 -->
    <div v-if="essayQuestions.length > 0" class="question-section">
      <h3>问答题</h3>
      <div v-for="(q, i) in essayQuestions" :key="'essay-' + i" class="question-item">
        <div class="question-number">{{ i + 1 }}.</div>
        <div class="question-content">
          <p class="question-text">{{ getQuestionText(q) }}</p>
          <div v-if="q.difficulty" class="question-difficulty">难度：{{ q.difficulty }}</div>
        </div>
      </div>
    </div>
    <div v-else class="no-questions">暂无问答题</div>

    <!-- 返回按钮 -->
    <div class="actions">
      <button class="btn secondary-btn" @click="goBack">返回</button>
    </div>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'PreviewExam',
  data() {
    return {
      exam: {
        taskCode: '',
        mode: '',
        questions: []
      },
      modeLabel: {
        random: '随机组卷',
        difficulty: '按难度组卷',
        knowledge: '按知识点组卷'
      },
      showDebug: true // 开发阶段显示调试信息，生产环境可设为 false
    };
  },
  computed: {
    mcQuestions() {
      const filtered = this.exam.questions.filter(q => {
        const type = q.type?.toUpperCase();
        // 选择题类型：单选、多选、判断题
        const isChoice = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'MULTIPLE', 'JUDGE', 'TRUE_FALSE'].includes(type);
        console.log(`题目 ${q.questionId} - 类型: ${type}, 是否选择题: ${isChoice}`);
        return isChoice;
      });
      console.log('选择题筛选结果:', filtered.length, '个题目');
      return filtered;
    },
    essayQuestions() {
      const filtered = this.exam.questions.filter(q => {
        const type = q.type?.toUpperCase();
        // 主观题类型：填空、简答、编程等
        const isEssay = ['FILL_BLANK', 'FILL', 'SHORT_ANSWER', 'PROGRAMMING', 'OTHER', 'ESSAY'].includes(type);
        console.log(`题目 ${q.questionId} - 类型: ${type}, 是否问答题: ${isEssay}`);
        return isEssay;
      });
      console.log('问答题筛选结果:', filtered.length, '个题目');
      return filtered;
    }
  },
  methods: {
    getOptionLabel(index) {
      return String.fromCharCode(65 + index); // A, B, C, D...
    },
    getQuestionText(question) {
      // 处理题目内容显示
      if (typeof question === 'string') {
        return `题目ID: ${question}`;
      }
      
      const content = question.content || question.questionText || question.question || question.stem;
      if (content) {
        return content;
      }
      
      // 如果没有找到题目内容，但有ID，显示ID
      const questionId = question.questionId || question.id;
      if (questionId) {
        return `题目ID: ${questionId}`;
      }
      
      return '题目内容缺失';
    },
    getOptionText(option) {
      if (typeof option === 'string') {
        return option;
      }
      return option.text || option.content || option.label || JSON.stringify(option);
    },
    
    // 新增：获取题目选项
    getQuestionOptions(question) {
      // 尝试多种可能的选项字段名
      const options = question.options || question.choices || question.optionList || [];
      
      // 如果选项是数组，直接返回
      if (Array.isArray(options)) {
        return options;
      }
      
      // 如果选项是对象，尝试转换为数组
      if (typeof options === 'object' && options !== null) {
        // 可能是 {A: "选项1", B: "选项2"} 格式
        return Object.values(options);
      }
      
      return [];
    },
    
    // 新增：根据题目ID批量获取题目详情
    async loadQuestionDetails(questionIds, questionBankId) {
      if (!questionIds || questionIds.length === 0) {
        console.log('PreviewExam: 没有题目ID需要加载');
        return [];
      }

      console.log('PreviewExam: 开始加载题目详情', { questionIds, questionBankId });
      
      try {
        // 方法1：尝试批量获取题目列表，然后筛选
        const res = await api.get(`/questionBank/${questionBankId}/question/list`);
        const allQuestions = res.data || res || [];
        console.log('PreviewExam: 获取到题库所有题目', allQuestions.length);
        console.log('PreviewExam: 题库中前3个题目的ID', allQuestions.slice(0, 3).map(q => q.questionId || q.id));
        
        // 根据ID筛选出需要的题目
        const filteredQuestions = allQuestions.filter(q => {
          const qId = q.questionId || q.id;
          const isIncluded = questionIds.includes(qId);
          if (isIncluded) {
            console.log(`PreviewExam: 找到匹配题目 ${qId}`);
          }
          return isIncluded;
        });
        
        console.log('PreviewExam: 筛选后的题目', filteredQuestions.length);
        console.log('PreviewExam: 筛选后的题目ID', filteredQuestions.map(q => q.questionId || q.id));
        
        if (filteredQuestions.length > 0) {
          console.log('PreviewExam: 第一个筛选题目详情', filteredQuestions[0]);
        }
        
        return filteredQuestions;
        
      } catch (err) {
        console.error('PreviewExam: 批量获取题目详情失败', err);
        
        // 方法2：如果批量获取失败，尝试逐个获取
        const questions = [];
        for (const qId of questionIds) {
          try {
            const res = await api.get(`/questionBank/${questionBankId}/question/${qId}`);
            const question = res.data || res;
            if (question) {
              questions.push(question);
            }
          } catch (singleErr) {
            console.error(`PreviewExam: 获取题目 ${qId} 失败`, singleErr);
            // 如果获取失败，添加一个占位对象
            questions.push({
              questionId: qId,
              content: `题目 ${qId} 加载失败`,
              type: 'UNKNOWN',
              options: []
            });
          }
        }
        return questions;
      }
    },
    
    // 修改：处理题目ID数组，获取完整题目信息
    async processQuestionIds(questionIds, questionBankId) {
      if (!Array.isArray(questionIds)) {
        console.log('PreviewExam: questionIds 不是数组', questionIds);
        return [];
      }
      
      // 如果题目已经是完整对象而不是ID字符串，直接返回
      if (questionIds.length > 0 && typeof questionIds[0] === 'object') {
        console.log('PreviewExam: 题目已是完整对象，无需加载详情');
        return questionIds;
      }
      
      console.log('PreviewExam: 开始处理题目ID数组', questionIds);
      console.log('PreviewExam: 使用题库ID', questionBankId);
      
      // 获取题目详情
      const detailedQuestions = await this.loadQuestionDetails(questionIds, questionBankId);
      console.log('PreviewExam: 获取到的详细题目数量', detailedQuestions.length);
      
      // 按照原始题目ID的顺序排列
      const orderedQuestions = [];
      for (const qId of questionIds) {
        const found = detailedQuestions.find(q => {
          const questionId = q.questionId || q.id;
          return questionId === qId;
        });
        if (found) {
          console.log(`PreviewExam: 为ID ${qId} 找到了题目详情`);
          orderedQuestions.push(found);
        } else {
          console.log(`PreviewExam: 为ID ${qId} 未找到题目详情，使用占位对象`);
          // 如果没找到，添加占位对象
          orderedQuestions.push({
            questionId: qId,
            content: `题目 ${qId} 未找到`,
            type: 'UNKNOWN',
            options: []
          });
        }
      }
      
      console.log('PreviewExam: 处理完成的题目数组', orderedQuestions);
      console.log('PreviewExam: 最终题目数量', orderedQuestions.length);
      return orderedQuestions;
    },

    goBack() {
      this.$router.back();
    }
  },
  async mounted() {
    const route = this.$route;
    const taskId = route.params.id;
    const paperId = route.query.paperId;
    const fromGenerated = route.query.fromGenerated;

    // 处理从生成试卷页面跳转过来的情况
    if (taskId === 'temp-preview' || fromGenerated === 'true') {
      const saved = localStorage.getItem('generatedExam');
      if (!saved) {
        alert('暂无预览试卷');
        this.$router.back();
        return;
      }
      try {
        const data = JSON.parse(saved);
        console.log('PreviewExam: 从localStorage加载的原始数据', data);
        
        // 初始化基础信息
        this.exam = {
          taskCode: data.taskCode || '未命名试卷',
          mode: data.mode || 'random',
          questions: data.questions || []
        };
        
        console.log('PreviewExam: 题目数量', this.exam.questions.length);
        console.log('PreviewExam: 题目ID数组', this.exam.questions);
        
        // 如果有题目ID且有题库ID，则获取题目详情
        if (this.exam.questions.length > 0 && data.questionBankId) {
          console.log('PreviewExam: 开始获取题目详情，题库ID:', data.questionBankId);
          try {
            this.exam.questions = await this.processQuestionIds(this.exam.questions, data.questionBankId);
            console.log('PreviewExam: 题目详情加载完成', this.exam.questions);
          } catch (err) {
            console.error('PreviewExam: 加载题目详情失败', err);
            alert('部分题目内容加载失败，将显示题目ID');
          }
        }
        
        if (this.exam.questions.length > 0) {
          console.log('PreviewExam: 第一题最终数据', this.exam.questions[0]);
        }
      } catch (err) {
        console.error('解析本地试卷失败', err);
        alert('无法预览试卷');
        this.$router.back();
      }
      return;
    }

    if (paperId) {
      try {
        console.log('PreviewExam: 开始加载试卷，paperId:', paperId);
        const res = await api.get(`/paper/${paperId}`);
        const paper = res?.data || res;
        
        console.log('PreviewExam: API响应完整数据', res);
        console.log('PreviewExam: 解析后的试卷数据', paper);
        
        if (!paper) {
          alert('试卷不存在或加载失败');
          return;
        }
        
        // 检查题目数据结构
        console.log('PreviewExam: 原始题目数组', paper.questions);
        console.log('PreviewExam: 题目数组类型检查', {
          isArray: Array.isArray(paper.questions),
          length: paper.questions?.length,
          firstItem: paper.questions?.[0],
          firstItemType: typeof paper.questions?.[0]
        });
        
        this.exam = {
          taskCode: paper.title || paper.paperId || '智能组卷试卷',
          mode: (paper.generationMethod || 'random').toLowerCase(),
          questions: paper.questions || []
        };
        
        // 检查questionBankId
        const questionBankId = paper.questionBankId || paper.bankId;
        console.log('PreviewExam: 题库ID查找结果', {
          questionBankId: paper.questionBankId,
          bankId: paper.bankId,
          final: questionBankId
        });
        
        // 如果题目是ID数组且有questionBankId，则获取详情
        if (this.exam.questions.length > 0 && questionBankId) {
          console.log('PreviewExam: 开始获取题目详情 - 题目数量:', this.exam.questions.length, '题库ID:', questionBankId);
          
          // 先检查题目是否已经是完整对象
          const firstQuestion = this.exam.questions[0];
          console.log('PreviewExam: 第一个题目检查', {
            value: firstQuestion,
            type: typeof firstQuestion,
            hasContent: firstQuestion?.content,
            hasQuestionText: firstQuestion?.questionText,
            isString: typeof firstQuestion === 'string'
          });
          
          try {
            this.exam.questions = await this.processQuestionIds(this.exam.questions, questionBankId);
            console.log('PreviewExam: 题目详情加载完成，最终题目数据:', this.exam.questions);
            if (this.exam.questions.length > 0) {
              console.log('PreviewExam: 第一个处理后的题目:', this.exam.questions[0]);
            }
          } catch (err) {
            console.error('PreviewExam: 加载服务器试卷题目详情失败', err);
            alert('部分题目内容加载失败，将显示题目ID');
          }
        } else {
          console.log('PreviewExam: 跳过题目详情加载', {
            questionsLength: this.exam.questions.length,
            hasQuestionBankId: !!questionBankId
          });
        }
        
      } catch (err) {
        console.error('加载试卷失败', err);
        alert('加载失败：' + (err.response?.data?.message || err.message));
      }
      return;
    }

    alert('缺少 paperId，无法加载试卷');
    this.$router.back();
  }
};
</script>


<style scoped>
.preview-exam {
  padding: 30px;
  max-width: 900px;
  margin: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

h3 {
  margin-top: 30px;
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
  border-left: 4px solid #007bff;
  padding-left: 10px;
}

.question-section {
  margin-bottom: 30px;
}

.question-item {
  display: flex;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fafafa;
}

.question-number {
  font-weight: bold;
  color: #007bff;
  margin-right: 10px;
  font-size: 16px;
  min-width: 30px;
}

.question-content {
  flex: 1;
}

.question-text {
  margin: 0 0 10px 0;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
}

.options {
  margin-top: 10px;
}

.option {
  margin: 5px 0;
  padding: 5px 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.question-difficulty {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.no-questions {
  text-align: center;
  color: #666;
  font-style: italic;
  margin: 20px 0;
}

.actions {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.secondary-btn {
  background-color: #6c757d;
  color: white;
}

.secondary-btn:hover {
  background-color: #5a6268;
}

.debug-info {
  font-size: 12px;
  color: #666;
}

.debug-info p {
  margin: 5px 0;
}
</style>
