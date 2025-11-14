import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
  type CognitoUserSession,
} from "amazon-cognito-identity-js"

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "",
}

const userPool = new CognitoUserPool(poolData)

export const signUp = (email: string, password: string, name: string, phone: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({ Name: "email", Value: email }),
      new CognitoUserAttribute({ Name: "name", Value: name }),
      new CognitoUserAttribute({ Name: "phone_number", Value: phone }),
    ]

    userPool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err)
        return
      }
      resolve(result)
    })
  })
}

export const signIn = (email: string, password: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    })

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        resolve(result)
      },
      onFailure: (err) => {
        reject(err)
      },
    })
  })
}

export const forgotPassword = (email: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    cognitoUser.forgotPassword({
      onSuccess: (result) => {
        resolve(result)
      },
      onFailure: (err) => {
        reject(err)
      },
    })
  })
}

export const confirmPassword = (email: string, code: string, newPassword: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: (result) => {
        resolve(result)
      },
      onFailure: (err) => {
        reject(err)
      },
    })
  })
}

export const getCurrentUser = (): Promise<CognitoUser | null> => {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser) {
      cognitoUser.getSession((err: any, session: CognitoUserSession) => {
        if (err || !session.isValid()) {
          resolve(null)
          return
        }
        resolve(cognitoUser)
      })
    } else {
      resolve(null)
    }
  })
}

export const signOut = (): void => {
  const cognitoUser = userPool.getCurrentUser()
  if (cognitoUser) {
    cognitoUser.signOut()
  }
}
