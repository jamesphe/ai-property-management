<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
        新建宣传文案
      </el-button>
    </div>

    <!-- 宣传文案列表 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      style="width: 100%; margin-top: 20px;"
    >
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="type" label="类型" width="120">
        <template slot-scope="{row}">
          <el-tag>{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="targetAudience" label="目标受众" width="120" />
      <el-table-column prop="creator" label="创建人" width="120" />
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
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="temp.title" placeholder="请输入活动标题" />
        </el-form-item>
        <el-form-item label="宣传类型" prop="type">
          <el-select v-model="temp.type" placeholder="请选择宣传类型">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标受众" prop="targetAudience">
          <el-select v-model="temp.targetAudience" placeholder="请选择目标受众">
            <el-option
              v-for="item in audienceOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间" prop="eventTime">
          <el-date-picker
            v-model="temp.eventTime"
            type="datetime"
            placeholder="选择活动时间"
          />
        </el-form-item>
        <el-form-item label="活动地点" prop="location">
          <el-input v-model="temp.location" placeholder="请输入活动地点" />
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="temp.description"
            type="textarea"
            :rows="4"
            placeholder="请输入活动主要内容，系统将自动生成宣传文案"
          />
        </el-form-item>
        <el-form-item label="宣传风格" prop="style">
          <el-radio-group v-model="temp.style">
            <el-radio label="正式">正式</el-radio>
            <el-radio label="活泼">活泼</el-radio>
            <el-radio label="温馨">温馨</el-radio>
            <el-radio label="简约">简约</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="temp.description" label="AI生成">
          <el-button type="primary" :loading="generating" @click="generateContent">
            生成文案
          </el-button>
          <el-button type="success" :loading="generatingPoster" @click="generatePoster">
            生成海报
          </el-button>
        </el-form-item>
        <el-form-item v-if="temp.generatedContent" label="文案预览">
          <div class="generated-content">
            <div class="preview-content" v-html="temp.generatedContent" />
            <div class="action-buttons">
              <el-button size="small" type="primary" @click="acceptContent">采用</el-button>
              <el-button size="small" @click="regenerateContent">重新生成</el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item v-if="temp.posterUrl" label="海报预览">
          <div class="poster-preview">
            <img :src="temp.posterUrl" alt="海报预览">
            <div class="action-buttons">
              <el-button size="small" type="primary" @click="acceptPoster">采用</el-button>
              <el-button size="small" @click="regeneratePoster">重新生成</el-button>
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
    <el-dialog title="宣传预览" :visible.sync="previewVisible" width="50%">
      <div class="preview-dialog">
        <h3>{{ previewData.title }}</h3>
        <div class="meta-info">
          <div>活动时间：{{ previewData.eventTime }}</div>
          <div>活动地点：{{ previewData.location }}</div>
          <div>目标受众：{{ previewData.targetAudience }}</div>
        </div>
        <div class="content" v-html="previewData.content" />
        <div v-if="previewData.posterUrl" class="poster">
          <img :src="previewData.posterUrl" alt="活动海报">
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

export default {
  name: 'Promotion',
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
      generatingPoster: false,
      temp: {
        id: undefined,
        title: '',
        type: '',
        targetAudience: '',
        eventTime: undefined,
        location: '',
        description: '',
        style: '正式',
        generatedContent: '',
        posterUrl: '',
        status: '草稿'
      },
      typeOptions: [
        { label: '活动宣传', value: '活动宣传' },
        { label: '便民通知', value: '便民通知' },
        { label: '节日祝福', value: '节日祝福' },
        { label: '品牌推广', value: '品牌推广' }
      ],
      audienceOptions: [
        { label: '全体业主', value: '全体业主' },
        { label: '老年业主', value: '老年业主' },
        { label: '青年业主', value: '青年业主' },
        { label: '儿童家庭', value: '儿童家庭' }
      ],
      previewData: {},
      rules: {
        title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
        type: [{ required: true, message: '请选择宣传类型', trigger: 'change' }],
        targetAudience: [{ required: true, message: '请选择目标受众', trigger: 'change' }],
        eventTime: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
        location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
        description: [{ required: true, message: '请输入活动描述', trigger: 'blur' }]
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
            title: '端午节包粽子活动',
            type: '活动宣传',
            targetAudience: '全体业主',
            creator: '张三',
            status: '已发布'
          },
          {
            id: 2,
            title: '小区环保日活动',
            type: '便民通知',
            targetAudience: '全体业主',
            creator: '李四',
            status: '审核中'
          }
        ]
        this.total = 2
        this.listLoading = false
      }, 500)
    },
    handleCreate() {
      this.dialogTitle = '新建宣传文案'
      this.temp = {
        id: undefined,
        title: '',
        type: '',
        targetAudience: '',
        eventTime: new Date(),
        location: '',
        description: '',
        style: '正式',
        generatedContent: '',
        posterUrl: '',
        status: '草稿'
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleEdit(row) {
      this.dialogTitle = '编辑宣传文案'
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
    generateContent() {
      if (!this.temp.description) {
        this.$message.warning('请先输入活动描述')
        return
      }
      this.generating = true
      // 模拟AI生成内容
      setTimeout(() => {
        this.temp.generatedContent = `
          <h4>${this.temp.title}</h4>
          <p>尊敬的${this.temp.targetAudience}：</p>
          <p>${this.temp.description}</p>
          <p>活动时间：${this.temp.eventTime}</p>
          <p>活动地点：${this.temp.location}</p>
          <p>期待您的参与！</p>
        `
        this.generating = false
      }, 1500)
    },
    generatePoster() {
      if (!this.temp.description) {
        this.$message.warning('请先输入活动描述')
        return
      }
      this.generatingPoster = true
      // 模拟AI生成海报
      setTimeout(() => {
        this.temp.posterUrl = 'https://example.com/poster.jpg' // 这里应该是实际生成的海报URL
        this.generatingPoster = false
      }, 2000)
    },
    acceptContent() {
      this.temp.content = this.temp.generatedContent
      this.temp.generatedContent = ''
    },
    acceptPoster() {
      // 采用生成的海报
      this.$message.success('已采用生成的海报')
    },
    regenerateContent() {
      this.generateContent()
    },
    regeneratePoster() {
      this.generatePoster()
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

.poster-preview {
  text-align: center;
  margin-top: 10px;

  img {
    max-width: 100%;
    max-height: 400px;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
  }

  .action-buttons {
    margin-top: 15px;
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
    margin-bottom: 20px;
  }

  .poster {
    text-align: center;

    img {
      max-width: 100%;
      max-height: 400px;
    }
  }
}
</style>
