import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/presentation/stores/authStore'
import { useEffect, Suspense, lazy } from 'react'
import { supabase } from '@/infrastructure/supabase/client'
import AppLayout from '@/presentation/components/layout/AppLayout'
import ProtectedRoute from '@/presentation/components/common/ProtectedRoute'
import AdminRoute from '@/presentation/components/common/AdminRoute'
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner'

const LoginPage = lazy(() => import('@/presentation/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/presentation/pages/DashboardPage'))
const BitacoraPage = lazy(() => import('@/presentation/pages/BitacoraPage'))
const NotFoundPage = lazy(() => import('@/presentation/pages/NotFoundPage'))
const CatalogPage = lazy(() => import('@/presentation/pages/CatalogPage'))

function App() {
  const { setUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    let mounted = true

    async function handleSession(userId: string | undefined) {
      if (!userId) {
        if (mounted) { setUser(null); setProfile(null) }
        return
      }
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        if (mounted && data) setProfile(data)
      } catch {
        // table not yet created or network error — ignore
      }
    }

    const safety = setTimeout(() => { if (mounted) setLoading(false) }, 5000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      if (session?.user) setUser(session.user)
      await handleSession(session?.user?.id)
      if (mounted) setLoading(false)
      clearTimeout(safety)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return
        if (session?.user) {
          setUser(session.user)
          handleSession(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      },
    )

    return () => {
      mounted = false
      clearTimeout(safety)
      subscription.unsubscribe()
    }
  }, [setUser, setProfile, setLoading])

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="bitacora" element={<BitacoraPage />} />
          <Route
            path="catalogos"
            element={
              <AdminRoute>
                <CatalogPage />
              </AdminRoute>
            }
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
    </BrowserRouter>
  )
}

export default App
