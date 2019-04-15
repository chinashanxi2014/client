// @flow
import * as React from 'react'
import * as Kb from '../../common-adapters'
import * as Styles from '../../styles'
import {map} from 'lodash-es'
import type {Position} from '../../common-adapters/relative-popup-hoc.types'
export type Role = 'Owner' | 'Admin' | 'Writer' | 'Reader'

// Controls the ordering of the role picker
const orderedRoles = ['Owner', 'Admin', 'Writer', 'Reader']

type DisabledReason = string

export type Props = {|
  disabledRoles?: {[key: Role]: DisabledReason},
  headerText?: string,
  // If provided, a cancel button will appear
  onCancel?: () => void,
  onConfirm: () => void,
  // Defaults to "Make ${selectedRole}"
  confirmLabel?: string,
  onSelectRole: (role: Role) => void,
  // The role they started with
  presetRole?: ?Role,
  selectedRole?: ?Role,
|}

type RoleRowProps = {
  body: React.Node,
  disabledReason: ?React.Node,
  icon: ?React.Node,
  selected: boolean,
  title: React.Node,
}
const RoleRow = (p: RoleRowProps) => (
  <Kb.Box2 direction={'vertical'} fullWidth={true} alignItems={'flex-start'} style={styles.row}>
    <Kb.Box2
      direction={'vertical'}
      fullWidth={true}
      style={Styles.collapseStyles([p.disabledReason ? styles.disabledRow : undefined, styles.rowChild])}
    >
      <Kb.Box2 direction={'horizontal'} alignItems={'center'} fullWidth={true}>
        <Kb.RadioButton label="" onSelect={() => {}} selected={p.selected} />
        {p.icon}
        {p.title}
      </Kb.Box2>
      <Kb.Box style={styles.rowBody}>
        {p.body}
        {p.disabledReason}
      </Kb.Box>
    </Kb.Box2>
  </Kb.Box2>
)

const rolesMetaInfo = (
  selectedRole: ?Role
): {[key: Role]: {cans: Array<string>, cants: Array<string>, icon: ?React.Node}} => ({
  Admin: {
    cans: [
      'Can manage team members roles',
      'Can create subteams and channels',
      'Can write and read in chats and folders',
    ],
    cants: [`Can't delete the team`],
    icon: (
      <Kb.Icon
        boxStyle={{paddingBottom: 0}}
        style={styles.roleIcon}
        type={'iconfont-crown-admin'}
        sizeType={'Small'}
      />
    ),
  },
  Owner: {
    cans: [
      'Can manage team members roles',
      'Can create subteams and channels',
      'Can write and read in chats and folders',
      'Can delete team',
    ],
    cants: [],
    extra: ['A team can have multiple owners'],
    icon: (
      <Kb.Icon
        style={styles.roleIcon}
        boxStyle={{paddingBottom: 0}}
        type={'iconfont-crown-owner'}
        sizeType={'Small'}
      />
    ),
  },
  Reader: {
    cans: ['Can write in chats but read only in folders'],
    cants: [
      `Can't create channels`,
      `Can't create subteams`,
      `Can't add and remove members`,
      `Can't manage team members' roles`,
      `Can't delete the team`,
    ],
    icon: null,
  },
  Writer: {
    cans: ['Can create channels', 'Can write and read in chats and folders'],
    cants: [
      `Can't create subteams`,
      `Can't add and remove members`,
      `Can't manage team members' roles`,
      `Can't delete the team`,
    ],
    icon: null,
  },
})

const roleAbilities = (
  abilities: Array<string>,
  canDo: boolean,
  addFinalPadding: boolean,
  selected: boolean
): Array<React.Node> => {
  return abilities.map((ability, i) => (
    <Kb.Box2
      key={ability}
      direction="horizontal"
      alignItems="flex-start"
      fullWidth={true}
      style={
        addFinalPadding && i === abilities.length - 1 ? {paddingBottom: Styles.globalMargins.tiny} : undefined
      }
    >
      <Kb.Icon
        type={canDo ? 'iconfont-check' : 'iconfont-close'}
        sizeType="Tiny"
        style={Styles.isMobile ? styles.abilityCheck : undefined}
        boxStyle={!Styles.isMobile ? styles.abilityCheck : undefined}
        color={canDo ? Styles.globalColors.green : Styles.globalColors.red}
      />
      <Kb.Text type="BodySmall">{ability}</Kb.Text>
    </Kb.Box2>
  ))
}

const roleElementHelper = (selectedRole: ?Role) =>
  orderedRoles
    .map(role => [role, rolesMetaInfo(selectedRole)[role]])
    .map(([role, roleInfo]) => ({
      body:
        selectedRole === role
          ? [
              roleAbilities(roleInfo.cans, true, roleInfo.cants.length === 0, selectedRole === role),
              roleAbilities(roleInfo.cants, false, true, selectedRole === role),
            ]
          : undefined,
      icon: roleInfo.icon,
      role,
      title: (
        <Kb.Text type="BodyBig" style={styles.text}>
          {role}
        </Kb.Text>
      ),
    }))

const disabledTextHelper = (text: string) => (
  <Kb.Text type="BodySmallError" style={styles.text}>
    {text}
  </Kb.Text>
)

const headerTextHelper = (text: ?string) =>
  !!text && (
    <>
      <Kb.Text type="BodySmall" style={styles.headerText}>
        {text}
      </Kb.Text>
      <Kb.Divider />
    </>
  )

const footButtonsHelper = (onCancel, onConfirm, confirmLabel) => (
  <Kb.Box2
    direction="horizontal"
    alignItems="flex-end"
    style={{
      flexGrow: 2,
      paddingBottom: Styles.globalMargins.small,
      paddingTop: Styles.globalMargins.tiny,
    }}
  >
    {!!onCancel && (
      <Kb.Button
        style={{
          alignSelf: 'flex-end',
          marginRight: Styles.globalMargins.tiny,
        }}
        type="Secondary"
        label="Cancel"
        onClick={onCancel}
      />
    )}
    <Kb.Button
      type="Primary"
      style={{
        alignSelf: 'flex-end',
      }}
      disabled={!onConfirm}
      label={confirmLabel}
      onClick={onConfirm}
    />
  </Kb.Box2>
)

const confirmLabelHelper = (presetRole: ?Role, selectedRole: ?Role): string => {
  let label = selectedRole && selectedRole.toLowerCase()
  if (label && presetRole === selectedRole) {
    return `Saved`
  }

  return label ? `Make ${label}` : `Pick a role`
}

const RolePicker = (props: Props) => {
  return (
    <Kb.Box2
      direction="vertical"
      alignItems={'stretch'}
      fullHeight={Styles.isMobile}
      fullWidth={Styles.isMobile}
      style={styles.container}
    >
      {headerTextHelper(props.headerText)}
      {map(
        roleElementHelper(props.selectedRole),
        // $FlowIssue, the library type for map is wrong
        ({role, ...nodeMap}: {[key: string]: React.Node, role: Role}): React.Node => (
          <Kb.ClickableBox
            key={role}
            onClick={
              props.disabledRoles && props.disabledRoles[role] ? undefined : () => props.onSelectRole(role)
            }
          >
            <RoleRow
              selected={props.selectedRole === role}
              title={nodeMap.title}
              body={nodeMap.body}
              icon={nodeMap.icon}
              disabledReason={
                props.disabledRoles &&
                props.disabledRoles[role] &&
                disabledTextHelper(props.disabledRoles[role])
              }
            />
          </Kb.ClickableBox>
        )
      ).map((row, i, arr) => [row, i === arr.length - 1 ? null : <Kb.Divider key={i} />])}
      {footButtonsHelper(
        props.onCancel,
        props.selectedRole && props.selectedRole !== props.presetRole ? props.onConfirm : undefined,
        props.confirmLabel || confirmLabelHelper(props.presetRole, props.selectedRole)
      )}
    </Kb.Box2>
  )
}

const styles = Styles.styleSheetCreate({
  abilityCheck: Styles.platformStyles({
    common: {
      paddingRight: Styles.globalMargins.tiny,
    },
    isElectron: {
      paddingTop: 6,
    },
    isMobile: {paddingTop: 4},
  }),
  checkIcon: {
    left: -24,
    paddingTop: 2,
    position: 'absolute',
  },
  container: Styles.platformStyles({
    common: {
      backgroundColor: Styles.globalColors.white,
    },
    isElectron: {
      borderColor: Styles.globalColors.blue,
      borderRadius: Styles.borderRadius,
      borderStyle: 'solid',
      borderWidth: 1,
      boxShadow: `0 0 3px 0 rgba(0, 0, 0, 0.15), 0 0 5px 0 ${Styles.globalColors.black_20_on_white}`,
      minHeight: 350,
      width: 310,
    },
  }),
  disabledRow: {
    opacity: 0.4,
  },
  headerText: {
    alignSelf: 'center',
    paddingBottom: Styles.globalMargins.tiny,
    paddingTop: Styles.globalMargins.tiny,
  },
  roleIcon: {
    paddingRight: Styles.globalMargins.xtiny,
  },
  row: Styles.platformStyles({
    common: {
      position: 'relative',
    },
  }),
  rowBody: Styles.platformStyles({
    // Width of the radio button. Used to align text with title
    isElectron: {
      paddingLeft: 22,
    },
    isMobile: {
      paddingLeft: 30,
    },
  }),
  rowChild: Styles.platformStyles({
    common: {
      paddingBottom: Styles.globalMargins.tiny,
      paddingLeft: Styles.globalMargins.small,
      paddingRight: Styles.globalMargins.small,
      paddingTop: Styles.globalMargins.tiny,
    },
  }),
  text: {
    textAlign: 'left',
  },
})

// Helper to use this as a floating box
export type FloatingProps = {|
  position?: Position,
  children: React.ChildrenArray<any>,
  open: boolean,
  ...Props,
|}

type S = {|
  ref: ?any,
|}

export class FloatingRolePicker extends React.Component<FloatingProps, S> {
  state = {ref: null}
  _returnRef = () => this.state.ref
  _setRef = ref => this.setState({ref})
  render() {
    const {position, children, open, ...props} = this.props
    return (
      <>
        <Kb.Box ref={this._setRef}>{children}</Kb.Box>
        {open && (
          <Kb.FloatingBox attachTo={this.state.ref && this._returnRef} position={position || 'top center'}>
            <RolePicker {...props} />
          </Kb.FloatingBox>
        )}
      </>
    )
  }
}

export default RolePicker