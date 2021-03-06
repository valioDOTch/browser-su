new class pointerLock extends Root {

	constructor() {
		super('pointerlock')

		this.state = 'unknown'

		let sandbox = (frameElement || {}).sandbox || []
		if(sandbox.length && !frameElement.sandbox.contains('allow-pointer-lock'))
			this.state = 'disabled'
	}

	query(resolve, reject) {
		let permission = new PermissionStatus(this.state)
		resolve(permission)
	}

	request(resolve, reject, opts) {
		if('event' in window && (!event || !event.isTrusted))
			throw new Error("Failed to execute 'requestPointerLock' on 'Element': API can only be initiated by a user gesture.")

		let immediately = now()

		once(document, 'pointerlockchange pointerlockerror', evt => {
			if(evt.type === 'pointerlockchange' && document.pointerLockElement)
				return resolve(this.state = 'granted')

			// A simple Boolean don't work cuz it is asynchronous but fast...
			if(now() - immediately < 10){
				this.state = 'denied'
				this.denied(reject)
			} else {
				// Deny in chrome don't block, it really means dissmiss...
				this.state = 'prompt'
				this.dismissed(reject)
			}
		})

		opts.element.requestPointerLock()
	}
}
