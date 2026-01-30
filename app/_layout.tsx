import { useAuthStore } from "@/store/auth.store"
import { Stack } from "expo-router"
import React from "react"

const _layout = () => {
     const {isAuthenticated, user} = useAuthStore()
    if (!isAuthenticated) {
        return <Stack>
            <Stack.Screen 
              name="login" 
              options={{
                headerShown: false,
              }}
            />
        </Stack>
    }

    if (user?.role === 'admin') { 
        return <Stack>
            <Stack.Screen 
              name="(admin)" 
              options={{
                headerShown: false,
              }}
            />
        </Stack>
    } 
    return  <Stack>
        <Stack.Screen 
          name="(student)" 
          options={{
            headerShown: false,
          }}
        />
    </Stack>
}

export default _layout