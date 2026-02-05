from app.services.policy import is_command_allowed


def test_policy_allow():
  assert is_command_allowed('show ip interface')
  assert is_command_allowed('ping 8.8.8.8')


def test_policy_deny():
  assert not is_command_allowed('configure terminal')
  assert not is_command_allowed('reload')


def test_deny_overrides_allow():
  assert not is_command_allowed('show running-config; reload')