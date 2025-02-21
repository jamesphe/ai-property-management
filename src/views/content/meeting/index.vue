<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
        新建会议纪要
      </el-button>
    </div>

    <!-- 会议纪要列表 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      style="width: 100%; margin-top: 20px;"
    >
      <el-table-column prop="title" label="会议主题" min-width="200" />
      <el-table-column prop="meetingTime" label="会议时间" width="160" />
      <el-table-column prop="duration" label="会议时长" width="100" />
      <el-table-column prop="creator" label="记录人" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status === '已发布' ? 'success' : row.status === '审核中' ? 'warning' : 'info'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="{row}">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handlePreview(row)">预览</el-button>
          <el-button
            v-if="row.status === '草稿'"
            type="text"
            @click="handleSubmit(row)"
          >
            提交审核
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 新建/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="70%">
      <el-form ref="dataForm" :model="temp" :rules="rules" label-width="100px">
        <el-form-item label="会议主题" prop="title">
          <el-input v-model="temp.title" placeholder="请输入会议主题" />
        </el-form-item>
        <el-form-item label="会议时间" prop="meetingTime">
          <el-date-picker
            v-model="temp.meetingTime"
            type="datetime"
            placeholder="选择会议时间"
          />
        </el-form-item>
        <el-form-item label="参会人员" prop="attendees">
          <el-select
            v-model="temp.attendees"
            multiple
            placeholder="请选择参会人员"
          >
            <el-option
              v-for="item in attendeeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="会议记录">
          <el-tabs v-model="recordType">
            <el-tab-pane label="上传录音" name="audio">
              <el-upload
                class="upload-demo"
                action="#"
                :before-upload="handleAudioUpload"
                :auto-upload="false"
                accept=".mp3,.wav"
              >
                <el-button size="small" type="primary">选择录音文件</el-button>
                <div slot="tip" class="el-upload__tip">支持mp3、wav格式音频文件</div>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="文字记录" name="text">
              <el-input
                v-model="temp.textRecord"
                type="textarea"
                :rows="6"
                placeholder="请输入会议记录文字内容"
              />
            </el-tab-pane>
          </el-tabs>
        </el-form-item>
        <el-form-item v-if="temp.textRecord || audioFile" label="AI生成">
          <el-button type="primary" :loading="generating" @click="generateMinutes">
            生成会议纪要
          </el-button>
        </el-form-item>
        <el-form-item v-if="temp.generatedContent" label="生成结果">
          <div class="generated-content">
            <div class="preview-content" v-html="temp.generatedContent" />
            <div class="action-buttons">
              <el-button size="small" type="primary" @click="acceptContent">采用</el-button>
              <el-button size="small" @click="regenerateContent">重新生成</el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveData">保存</el-button>
      </div>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog title="会议纪要预览" :visible.sync="previewVisible" width="50%">
      <div class="preview-dialog">
        <h3>{{ previewData.title }}</h3>
        <div class="meta-info">
          <div>会议时间：{{ previewData.meetingTime }}</div>
          <div>参会人员：{{ previewData.attendees }}</div>
          <div>记录人：{{ previewData.creator }}</div>
        </div>
        <div class="content" v-html="previewData.content" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

export default {
  name: 'MeetingMinutes',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 10
      },
      dialogVisible: false,
      dialogTitle: '',
      previewVisible: false,
      generating: false,
      recordType: 'text',
      audioFile: null,
      temp: {
        id: undefined,
        title: '',
        meetingTime: undefined,
        attendees: [],
        textRecord: '',
        generatedContent: '',
        status: '草稿'
      },
      attendeeOptions: [
        { label: '张三', value: '张三' },
        { label: '李四', value: '李四' },
        { label: '王五', value: '王五' }
      ],
      previewData: {},
      rules: {
        title: [{ required: true, message: '请输入会议主题', trigger: 'blur' }],
        meetingTime: [{ required: true, message: '请选择会议时间', trigger: 'change' }],
        attendees: [{ required: true, message: '请选择参会人员', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      // 模拟API调用
      setTimeout(() => {
        this.list = [
          {
            id: 1,
            title: '产品部周会',
            meetingTime: '2024-03-20 14:30',
            duration: '1小时',
            creator: '张三',
            status: '已发布'
          },
          {
            id: 2,
            title: '业主委员会会议',
            meetingTime: '2024-03-19 10:00',
            duration: '2小时',
            creator: '李四',
            status: '审核中'
          }
        ]
        this.total = 2
        this.listLoading = false
      }, 500)
    },
    handleAudioUpload(file) {
      this.audioFile = file
      return false // 阻止自动上传
    },
    handleCreate() {
      this.dialogTitle = '新建会议纪要'
      this.temp = {
        id: undefined,
        title: '',
        meetingTime: new Date(),
        attendees: [],
        textRecord: '',
        generatedContent: '',
        status: '草稿'
      }
      this.audioFile = null
      this.recordType = 'text'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleEdit(row) {
      this.dialogTitle = '编辑会议纪要'
      this.temp = Object.assign({}, row)
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handlePreview(row) {
      this.previewData = Object.assign({}, row)
      this.previewVisible = true
    },
    handleSubmit(row) {
      this.$confirm('确认提交审核?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟API调用
        this.$message.success('提交成功')
        row.status = '审核中'
      })
    },
    generateMinutes() {
      if (!this.temp.textRecord && !this.audioFile) {
        this.$message.warning('请先输入会议记录或上传录音文件')
        return
      }
      this.generating = true
      // 模拟AI生成内容
      setTimeout(() => {
        this.temp.generatedContent = `
          <h4>会议纪要</h4>
          <p><strong>会议主题：</strong>${this.temp.title}</p>
          <p><strong>会议时间：</strong>${this.temp.meetingTime}</p>
          <p><strong>参会人员：</strong>${this.temp.attendees.join('、')}</p>
          <p><strong>会议内容：</strong></p>
          <p>1. 议题一...</p>
          <p>2. 议题二...</p>
          <p><strong>会议结论：</strong></p>
          <p>1. 结论一...</p>
          <p>2. 结论二...</p>
        `
        this.generating = false
      }, 1500)
    },
    acceptContent() {
      this.temp.content = this.temp.generatedContent
      this.temp.generatedContent = ''
    },
    regenerateContent() {
      this.generateMinutes()
    },
    saveData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 模拟API调用
          this.$message.success('保存成功')
          this.dialogVisible = false
          this.getList()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 10px;
}

.generated-content {
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  padding: 15px;
  margin-top: 10px;

  .preview-content {
    min-height: 100px;
    margin-bottom: 15px;
  }

  .action-buttons {
    text-align: right;
    border-top: 1px solid #EBEEF5;
    padding-top: 15px;
  }
}

.preview-dialog {
  padding: 20px;

  h3 {
    text-align: center;
    margin-bottom: 20px;
  }

  .meta-info {
    color: #909399;
    margin-bottom: 30px;

    div {
      margin-bottom: 10px;
    }
  }

  .content {
    line-height: 1.8;
  }
}
</style>
