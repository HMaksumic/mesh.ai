import { useState } from 'react'
import type { ConnectionDetails } from '@mesh/shared'
import Button from './ui/Button'
import Input from './ui/Input'
import Card from './ui/Card'

interface ConnectionDialogProps {
  onConnect: (connection: ConnectionDetails) => void
  onCancel: () => void
}

export default function ConnectionDialog({ onConnect, onCancel }: ConnectionDialogProps) {
  const [host, setHost] = useState('')
  const [port, setPort] = useState('22')
  const [username, setUsername] = useState('')
  const [authMethod, setAuthMethod] = useState<'interactive' | 'password' | 'key'>('interactive')
  const [password, setPassword] = useState('')
  const [privateKey, setPrivateKey] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const connection: ConnectionDetails = {
      host,
      port: parseInt(port),
      username,
      password: authMethod === 'password' ? password : undefined,
      private_key: authMethod === 'key' ? privateKey : undefined
    }

    onConnect(connection)
  }

  const isValid = host && port && username

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6">
        <h2 className="mb-4 text-xl font-semibold">New SSH Connection</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Host
            </label>
            <Input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="hostname or IP address"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Port
            </label>
            <Input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="22"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Username
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Authentication Method
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="authMethod"
                  value="interactive"
                  checked={authMethod === 'interactive'}
                  onChange={() => setAuthMethod('interactive')}
                  className="mr-2"
                />
                Interactive (prompt in terminal)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="authMethod"
                  value="password"
                  checked={authMethod === 'password'}
                  onChange={() => setAuthMethod('password')}
                  className="mr-2"
                />
                Password
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="authMethod"
                  value="key"
                  checked={authMethod === 'key'}
                  onChange={() => setAuthMethod('key')}
                  className="mr-2"
                />
                Private Key
              </label>
            </div>
          </div>

          {authMethod === 'password' ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
              />
            </div>
          ) : authMethod === 'key' ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Private Key Path
              </label>
              <Input
                type="text"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="/path/to/private/key or paste key content"
                required
              />
              <p className="mt-1 text-xs text-neutral-500">
                Enter the path to your private key file (e.g., ~/.ssh/id_rsa)
              </p>
            </div>
          ) : (
            <div className="rounded-md bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                You'll be prompted for your password in the terminal after connecting
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={!isValid} className="flex-1">
              Connect
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
