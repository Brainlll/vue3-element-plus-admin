<!--
 * @Description:
 * @Author: gumingchen
 * @Email: 1240235512@qq.com
 * @Date: 2021-04-21 22:52:19
 * @LastEditors: gumingchen
 * @LastEditTime: 2021-05-28 22:36:10
-->
<template>
  <div class="g-container">
    <el-form ref="refForm" :inline="true" @keyup.enter="getList()">
      <el-form-item>
        <el-input v-model="form.bean_name" :placeholder="t('field.fullName', ['Bean'])" clearable />
      </el-form-item>
      <el-form-item>
        <el-button @click="getList()">{{ t('button.query') }}</el-button>
        <el-button @click="clearJson(form), getList()">{{ t('button.reset') }}</el-button>
        <el-button v-permission="'base:schedule:task:create'" type="primary" @click="addEditHandle()">{{ t('button.add') }}</el-button>
        <el-button
          v-permission="'base:schedule:task:run'"
          type="danger"
          @click="runHandle()"
          :disabled="selection.length <= 0">{{ t('base.task.batch', [t('base.task.immediately')]) }}</el-button>
        <el-button
          v-permission="'base:schedule:task:resume'"
          type="danger"
          @click="resumeHandle()"
          :disabled="selection.length <= 0">{{ t('base.task.batch', [t('base.task.resume')]) }}</el-button>
        <el-button
          v-permission="'base:schedule:task:pause'"
          type="danger"
          @click="pauseHandle()"
          :disabled="selection.length <= 0">{{ t('base.task.batch', [t('base.task.pause')]) }}</el-button>
        <el-button
          v-permission="'base:schedule:task:delete'"
          type="danger"
          @click="delHandle()"
          :disabled="selection.length <= 0">{{ t('button.batchDelete') }}</el-button>
      </el-form-item>
    </el-form>
    <el-table
      border
      class="g-table"
      element-loading-spinner="el-icon-loading"
      v-loading="loading"
      :data="list"
      @selection-change="selectionHandle">
      <el-table-column align="center" type="selection" width="50" />
      <el-table-column
        align="center"
        label="ID"
        prop="id"
        width="80" />
      <el-table-column
        align="center"
        :label="t('field.fullName', ['Bean'])"
        prop="bean_name"
        min-width="120" />
      <el-table-column
        align="center"
        :label="t('base.task.expression', ['Cron'])"
        prop="cron_expression"
        width="160px" />
      <el-table-column
        align="center"
        :label="t('base.task.parameter')"
        prop="params" />
      <el-table-column
        align="center"
        :label="t('field.state')"
        prop="status"
        width="80px">
        <template v-slot="{ row }">
          <el-tag v-if="row.status === 1" type="success">{{ t('base.task.normal') }}</el-tag>
          <el-tag v-if="row.status === 0" type="info">{{ t('base.task.pause') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        :label="t('field.remark')"
        prop="remark"
        min-width="200px" />
      <el-table-column
        align="center"
        :label="t('field.operation')"
        width="240"
        fixed="right">
        <template v-slot="{ row }">
          <el-button
            v-permission="'base:schedule:task:update'"
            type="text"
            size="small"
            @click="addEditHandle(row.id)">{{ t('button.edit') }}</el-button>
          <el-button
            v-permission="'base:schedule:task:run'"
            type="text"
            size="small"
            @click="runHandle(row.id)">{{ t('base.task.immediately') }}</el-button>
          <el-button
            v-if="row.status === 0"
            v-permission="'base:schedule:task:resume'"
            type="text"
            size="small"
            @click="resumeHandle(row.id)">{{ t('base.task.resume') }}</el-button>
          <el-button
            v-if="row.status === 1"
            v-permission="'base:schedule:task:pause'"
            type="text"
            size="small"
            @click="pauseHandle(row.id)">{{ t('base.task.pause') }}</el-button>
          <el-button
            v-permission="'base:schedule:task:delete'"
            type="text"
            size="small"
            @click="delHandle(row.id)">{{ t('button.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <page :page="page" @change="pageChangeHandle" />
    <add-edit ref="refAddEdit" v-if="visible" @refresh="getList" />
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onBeforeMount, reactive, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import usePage, { IPage } from '@/mixins/page'
import useInstance from '@/mixins/instance'
import Page from 'V/components/page/index.vue'
import AddEdit from './components/add-edit.vue'
import { clearJson } from '@/utils'

import { delApi, pageApi, pauseApi, resumeApi, runApi } from '@/api/base/task'
import { Task } from 'Type/task'

export default defineComponent({
  components: { Page, AddEdit },
  setup() {
    const { t } = useI18n()
    const { $message, $confirm } = useInstance()

    const refForm = ref()
    const refAddEdit = ref()
    const { page } = usePage()
    const data = reactive({
      loading: false,
      visible: false,
      form: {
        bean_name: ''
      },
      list: [] as Task.Base[],
      selection: [] as Task.Base[]
    })

    const getList = (): void => {
      const params = {
        ...data.form,
        current: page.current,
        size: page.size
      }
      data.loading = true
      pageApi(params).then(r => {
        if (r) {
          data.list = r.data.list
          page.total = r.data.total
        }
        nextTick(() => {
          data.loading = false
        })
      })
    }

    /**
     * @description: 新增/编辑弹窗
     * @param {*}
     * @return {*}
     * @author: gumingchen
     */
    const addEditHandle = (id?: number): void => {
      data.visible = true
      nextTick(() => {
        refAddEdit.value.init(id)
      })
    }

    /**
     * @description: 删除
     * @param {number} id
     * @return {*}
     * @author: gumingchen
     */
    const delHandle = (id: number): void => {
      let params: number[]
      if (id) {
        params = [id]
      } else {
        params = data.selection.map(item => item.id!)
      }
      $confirm(t('tip.confirmOptionTips', [params.join(','), t(id ? 'button.delete' : 'button.batchDelete')]), t('tip.tips'), {
        confirmButtonText: t('button.confirm'),
        cancelButtonText: t('button.cancel'),
        type: 'warning'
      }).then(() => {
        delApi(params).then(r => {
          if (r) {
            $message({
              message: t('tip.success'),
              type: 'success'
            })
            getList()
          }
        })
      }).catch(() => {
        // to do something on canceled
      })
    }

    /**
     * @description: 立即执行
     * @param {number} id
     * @return {*}
     * @author: gumingchen
     */
    const runHandle = (id: number): void => {
      let params: number[]
      if (id) {
        params = [id]
      } else {
        params = data.selection.map(item => item.id!)
      }
      $confirm(t('tip.confirmOptionTips', [params.join(','), id ? t('base.task.immediately') : t('base.task.batch', [t('base.task.immediately')])]), t('tip.tips'), {
        confirmButtonText: t('button.confirm'),
        cancelButtonText: t('button.cancel'),
        type: 'warning'
      }).then(() => {
        runApi(params).then(r => {
          if (r) {
            $message({
              message: t('tip.success'),
              type: 'success'
            })
            getList()
          }
        })
      }).catch(() => {
        // to do something on canceled
      })
    }

    /**
     * @description: 恢复
     * @param {number} id
     * @return {*}
     * @author: gumingchen
     */
    const resumeHandle = (id: number): void => {
      let params: number[]
      if (id) {
        params = [id]
      } else {
        params = data.selection.map(item => item.id!)
      }
      $confirm(t('tip.confirmOptionTips', [params.join(','), id ? t('base.task.resume') : t('base.task.batch', [t('base.task.resume')])]), t('tip.tips'), {
        confirmButtonText: t('button.confirm'),
        cancelButtonText: t('button.cancel'),
        type: 'warning'
      }).then(() => {
        resumeApi(params).then(r => {
          if (r) {
            $message({
              message: t('tip.success'),
              type: 'success'
            })
            getList()
          }
        })
      }).catch(() => {
        // to do something on canceled
      })
    }

    /**
     * @description: 暂停
     * @param {number} id
     * @return {*}
     * @author: gumingchen
     */
    const pauseHandle = (id: number): void => {
      let params: number[]
      if (id) {
        params = [id]
      } else {
        params = data.selection.map(item => item.id!)
      }
      $confirm(t('tip.confirmOptionTips', [params.join(','), id ? t('base.task.pause') : t('base.task.batch', [t('base.task.pause')])]), t('tip.tips'), {
        confirmButtonText: t('button.confirm'),
        cancelButtonText: t('button.cancel'),
        type: 'warning'
      }).then(() => {
        pauseApi(params).then(r => {
          if (r) {
            $message({
              message: t('tip.success'),
              type: 'success'
            })
            getList()
          }
        })
      }).catch(() => {
        // to do something on canceled
      })
    }

    /**
     * @description: table多选事件
     * @param {*} val
     * @return {*}
     * @author: gumingchen
     */
    const selectionHandle = (val: Task.Base[]): void => {
      data.selection = val
    }

    /**
     * @description: 分页变化事件
     * @param {*}
     * @return {*}
     * @author: gumingchen
     */
    const pageChangeHandle = (argPage: IPage): void => {
      page.current = argPage.current
      page.size = argPage.size
      getList()
    }

    onBeforeMount(() => {
      getList()
    })

    return {
      refForm,
      refAddEdit,
      page,
      ...toRefs(data),
      getList,
      addEditHandle,
      delHandle,
      runHandle,
      resumeHandle,
      pauseHandle,
      selectionHandle,
      pageChangeHandle,
      t,
      clearJson
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
