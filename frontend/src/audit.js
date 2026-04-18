const audit = async (id, status) => {
  try {
    // 1. 更新申请状态
    await api.updateApplication(id, status)

    // 2. 获取申请详情（用于群组通知）
    const applications = await api.getApplications()
    const app = applications.find(a => a.id === id)
    if (app) {
      // 3. 调用 Bot 通知审核结果
      await axios.post('http://localhost:3000/notify-audit', {
        username: app.username,
        status: status,
        groupId: '1' // TODO: 实际应用中应从群组关联表中获取
      })
      alert(`审核已通知用户: ${status === 'approved' ? '通过' : '拒绝'}`)
    }

    await fetchData()
  } catch (e) {
    alert('审核失败。Audit failed.')
  }
}