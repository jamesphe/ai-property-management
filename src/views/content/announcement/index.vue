<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
        新建公告
      </el-button>
    </div>

    <!-- 公告列表 -->
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
      <el-table-column prop="createTime" label="创建时间" width="160" />
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
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="temp.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="公告类型" prop="type">
          <el-select v-model="temp.type" placeholder="请选择公告类型">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发布时间" prop="publishTime">
          <el-date-picker
            v-model="temp.publishTime"
            type="datetime"
            placeholder="选择发布时间"
          />
        </el-form-item>
        <el-form-item label="公告内容" prop="content">
          <el-input
            v-model="temp.content"
            type="textarea"
            :rows="4"
            placeholder="请输入公告主要内容关键词，系统将自动生成完整公告"
          />
        </el-form-item>
        <el-form-item v-if="temp.content" label="AI生成">
          <el-button type="primary" :loading="generating" @click="generateContent">
            生成公告内容
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
    <el-dialog title="公告预览" :visible.sync="previewVisible" width="50%">
      <div class="preview-dialog">
        <h3>{{ previewData.title }}</h3>
        <div class="meta-info">
          <span>发布时间：{{ previewData.publishTime }}</span>
          <span>发布人：{{ previewData.creator }}</span>
        </div>
        <div class="content" v-html="previewData.content" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

export default {
  name: 'Announcement',
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
      temp: {
        id: undefined,
        title: '',
        type: '',
        publishTime: undefined,
        content: '',
        generatedContent: '',
        status: '草稿'
      },
      typeOptions: [
        { label: '通知公告', value: '通知公告' },
        { label: '活动通知', value: '活动通知' },
        { label: '维修通知', value: '维修通知' },
        { label: '温馨提示', value: '温馨提示' }
      ],
      previewData: {},
      rules: {
        title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
        type: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
        publishTime: [{ required: true, message: '请选择发布时间', trigger: 'change' }],
        content: [{ required: true, message: '请输入公告内容关键词', trigger: 'blur' }]
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
            title: '关于小区环境整治的通知',
            type: '通知公告',
            createTime: '2024-03-20 10:30',
            creator: '张三',
            status: '已发布',
            content: '为提升小区环境...'
          },
          {
            id: 2,
            title: '端午节活动预告',
            type: '活动通知',
            createTime: '2024-03-19 15:20',
            creator: '李四',
            status: '审核中',
            content: '端午节期间...'
          }
        ]
        this.total = 2
        this.listLoading = false
      }, 500)
    },
    handleCreate() {
      this.dialogTitle = '新建公告'
      this.temp = {
        id: undefined,
        title: '',
        type: '',
        publishTime: new Date(),
        content: '',
        generatedContent: '',
        status: '草稿'
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleEdit(row) {
      this.dialogTitle = '编辑公告'
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
      if (!this.temp.content) {
        this.$message.warning('请先输入公告内容关键词')
        return
      }
      this.generating = true
      // 模拟AI生成内容
      setTimeout(() => {
        this.temp.generatedContent = `
          <p>尊敬的业主：</p>
          <p>${this.temp.content}</p>
          <p>特此通知。</p>
        `
        this.generating = false
      }, 1000)
    },
    acceptContent() {
      this.temp.content = this.temp.generatedContent
      this.temp.generatedContent = ''
    },
    regenerateContent() {
      this.generateContent()
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
    text-align: center;
    color: #909399;
    margin-bottom: 30px;

    span {
      margin: 0 10px;
    }
  }

  .content {
    line-height: 1.8;
  }
}
</style>
