export interface DeviceIdentityRepository {
  /**
   * Stable anonymous id for this browser, created on first use. It identifies
   * the sync target while authentication remains an open product decision.
   */
  getDeviceId(): Promise<string>
}
