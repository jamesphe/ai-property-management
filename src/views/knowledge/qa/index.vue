<template>
  <div class="app-container">
    <div class="qa-container">
      <!-- 问答历史 -->
      <div class="chat-history">
        <div v-for="(item, index) in chatHistory" :key="index" class="chat-item" :class="item.type">
          <div class="chat-content">
            <div class="chat-text">{{ item.content }}</div>
            <div v-if="item.type === 'answer'" class="chat-sources">
              <div class="sources-title">参考来源：</div>
              <div v-for="(source, idx) in item.sources" :key="idx" class="source-item">
                <el-link type="primary" @click="handleViewSource(source)">{{ source.title }}</el-link>
                <span class="source-score">相关度: {{ source.score }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <el-input
          v-model="question"
          type="textarea"
          :rows="3"
          placeholder="请输入您的问题"
          @keyup.enter.native="handleAsk"
        />
        <div class="input-actions">
          <el-button type="primary" :loading="answering" @click="handleAsk">提问</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerService',
  data() {
    return {
      chatHistory: [],
      question: '',
      answering: false
    }
  },
  methods: {
    handleAsk() {
      if (!this.question.trim()) {
        this.$message.warning('请输入问题')
        return
      }

      // 添加问题到历史记录
      this.chatHistory.push({
        type: 'question',
        content: this.question
      })

      this.answering = true
      // 模拟AI回答
      setTimeout(() => {
        this.chatHistory.push({
          type: 'answer',
          content: '根据相关规定，物业费的收取标准是根据物业服务等级、配套设施情况等因素综合确定的。具体到我们小区，目前执行的标准是普通住宅2.5元/平方米/月，别墅区3.5元/平方米/月。',
          sources: [
            {
              title: '物业管理规章制度V2.0',
              score: 95,
              url: '#'
            },
            {
              title: '物业收费标准说明',
              score: 85,
              url: '#'
            }
          ]
        })
        this.answering = false
        this.question = ''
      }, 1500)
    },
    handleViewSource(source) {
      // 查看参考来源文档
      this.$message.info('查看文档: ' + source.title)
    }
  }
}
</script>

<style lang="scss" scoped>
.qa-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.chat-history {
  flex: 1;
  padding: 20px;
  overflow-y: auto;

  .chat-item {
    margin-bottom: 20px;
    display: flex;

    &.question {
      justify-content: flex-end;

      .chat-content {
        background: #ecf5ff;
      }
    }

    &.answer {
      justify-content: flex-start;

      .chat-content {
        background: #f4f4f5;
      }
    }

    .chat-content {
      max-width: 80%;
      padding: 15px;
      border-radius: 4px;

      .chat-text {
        line-height: 1.5;
        margin-bottom: 10px;
      }

      .chat-sources {
        font-size: 13px;
        color: #909399;

        .sources-title {
          margin-bottom: 5px;
        }

        .source-item {
          display: flex;
          align-items: center;
          margin-bottom: 3px;

          .source-score {
            margin-left: 10px;
            color: #67c23a;
          }
        }
      }
    }
  }
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #dcdfe6;

  .input-actions {
    margin-top: 10px;
    text-align: right;
  }
}
</style>
