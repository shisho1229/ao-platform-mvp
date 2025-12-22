import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'musashikosugi@juku.loohcs.co.jp'
  const password = 'ChangeMe123!' // 初回ログイン後に変更してください
  const name = '武蔵小杉管理者'
  const campus = '武蔵小杉'

  console.log('Creating SUPER_ADMIN account...')

  // 既存のユーザーをチェック
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log('User already exists. Updating to SUPER_ADMIN...')

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: 'SUPER_ADMIN',
        approved: true,
      },
    })

    console.log('✅ User updated successfully!')
    console.log('Email:', updatedUser.email)
    console.log('Role:', updatedUser.role)
    return
  }

  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash(password, 10)

  // 新しいユーザーを作成
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      campus,
      role: 'SUPER_ADMIN',
      approved: true,
    },
  })

  console.log('✅ SUPER_ADMIN account created successfully!')
  console.log('')
  console.log('=== Login Credentials ===')
  console.log('Email:', email)
  console.log('Password:', password)
  console.log('========================')
  console.log('')
  console.log('⚠️  IMPORTANT: Please change the password after first login!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
