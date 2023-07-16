export async function getQuestionToken() {
  const res =  await fetch("/User/chat", {
    method: "POST"
  })
  if (!res.ok) {
    console.log(res)
    return {status: res.status, msg: res.statusText};
  }

  return await res.json()
}