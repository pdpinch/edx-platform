define([
    'backbone', 'coffee/src/main', 'js/models/group_configuration',
    'js/models/group', 'js/collections/group', 'squire'
], function(
    Backbone, main, GroupConfigurationModel, GroupModel, GroupCollection, Squire
) {
    'use strict';
    beforeEach(function() {
      this.addMatchers({
        toBeInstanceOf: function(expected) {
          return this.actual instanceof expected;
        }
      });
    });

    describe('GroupConfigurationModel', function() {
        beforeEach(function() {
            main();
            this.model = new GroupConfigurationModel();
        });

        describe('Basic', function() {
            it('should have an empty name by default', function() {
                expect(this.model.get('name')).toEqual('');
            });

            it('should have an empty description by default', function() {
                expect(this.model.get('description')).toEqual('');
            });

            it('should not show groups by default', function() {
                expect(this.model.get('showGroups')).toBeFalsy();
            });

            it('should have a GroupSet with two groups by default', function() {
                var groups = this.model.get('groups');

                expect(groups).toBeInstanceOf(GroupCollection);
                expect(groups.at(0).get('name')).toBe('Group A');
                expect(groups.at(1).get('name')).toBe('Group B');
            });

            it('should be able to reset itself', function() {
                this.model.set('name', 'foobar');
                this.model.reset();

                expect(this.model.get('name')).toEqual('');
            });

            it('should be dirty after it\'s been changed', function() {
                this.model.set('name', 'foobar');

                expect(this.model.isDirty()).toBeTruthy();
            });

            describe('should not be dirty', function () {
                it('by default', function() {
                    expect(this.model.isDirty()).toBeFalsy();
                });

                it('after calling setOriginalAttributes', function() {
                    this.model.set('name', 'foobar');
                    this.model.setOriginalAttributes();

                    expect(this.model.isDirty()).toBeFalsy();
                });
            });
        });

        describe('Input/Output', function() {
            var deepAttributes = function(obj) {
                if (obj instanceof Backbone.Model) {
                    return deepAttributes(obj.attributes);
                } else if (obj instanceof Backbone.Collection) {
                    return obj.map(deepAttributes);
                } else if (_.isArray(obj)) {
                    return _.map(obj, deepAttributes);
                } else if (_.isObject(obj)) {
                    var attributes = {};

                    for (var prop in obj) {
                        if (obj.hasOwnProperty(prop)) {
                            attributes[prop] = deepAttributes(obj[prop]);
                        }
                    }
                    return attributes;
                } else {
                    return obj;
                }
            };

            it('should match server model to client model', function() {
                var serverModelSpec = {
                      'id': 10,
                      'name': 'My Group Configuration',
                      'description': 'Some description',
                      'groups': [
                        {
                          'name': 'Group 1'
                        }, {
                          'name': 'Group 2'
                        }
                      ]
                    },
                    clientModelSpec = {
                      'id': 10,
                      'name': 'My Group Configuration',
                      'description': 'Some description',
                      'showGroups': false,
                      'editing': false,
                      'groups': [
                        {
                          'name': 'Group 1'
                        }, {
                          'name': 'Group 2'
                        }
                      ]
                    },
                    model = new GroupConfigurationModel(serverModelSpec);

                expect(deepAttributes(model)).toEqual(clientModelSpec);
                expect(model.toJSON()).toEqual(serverModelSpec);
            });
        });

        describe('Validation', function() {
            it('requires a name', function() {
                var model = new GroupConfigurationModel({ name: '' });

                expect(model.isValid()).toBeFalsy();
            });

            it('can pass validation', function() {
                var model = new GroupConfigurationModel({ name: 'foo' });

                expect(model.isValid()).toBeTruthy();
            });
        });
    });

    describe('GroupModel', function() {
        beforeEach(function() {
            this.collection = new GroupCollection([{}]);
            this.model = this.collection.at(0);
        });

        describe('Basic', function() {
            it('should have a name by default', function() {
                expect(this.model.get('name')).toEqual('Group A');
            });

            it('should not be empty by default', function() {
                expect(this.model.isEmpty()).toBeFalsy();
            });
        });

        describe('Validation', function() {
            it('requires a name', function() {
                var model = new GroupModel({ name: '' });

                expect(model.isValid()).toBeFalsy();
            });

            it('can pass validation', function() {
                var model = new GroupConfigurationModel({ name: 'foo' });

                expect(model.isValid()).toBeTruthy();
            });

            it('requires at least two groups', function() {
                var group1 = new GroupModel({ name: 'Group A' }),
                    group2 = new GroupModel({ name: 'Group B' }),
                    model = new GroupConfigurationModel({ name: 'foo' });

                model.get('groups').reset([group1]);
                expect(model.isValid()).toBeFalsy();

                model.get('groups').add(group2);
                expect(model.isValid()).toBeTruthy();
            });

            it('requires a valid group', function() {
                var group = new GroupModel(),
                    model = new GroupConfigurationModel({ name: 'foo' });

                model.get('groups').reset([group]);

                expect(model.isValid()).toBeFalsy();
            });

            it('requires all groups to be valid', function() {
                var group1 = new GroupModel({ name: 'Group A' }),
                    group2 = new GroupModel(),
                    model = new GroupConfigurationModel({ name: 'foo' });

                model.get('groups').reset([group1, group2]);

                expect(model.isValid()).toBeFalsy();
            });
        });

        describe('getGroupId', function () {
            var model, injector, mockGettext, initializeGroupModel;

            mockGettext = function (returnedValue) {
                var injector = new Squire();

                injector.mock('gettext', function () {
                    return function () { return returnedValue; };
                });

                return injector;
            };

            initializeGroupModel = function (dict, that) {
                runs(function() {
                    injector = mockGettext(dict);
                    injector.require(['js/models/group'], function(GroupModel) {
                        var collection = new GroupCollection();
                        model = new GroupModel();
                        collection.reset([model]);
                    });
                });

                waitsFor(function() {
                    return model;
                }, 'GroupModel was not instantiated', 500);

                that.after(function () {
                    model = null;
                    injector.clean();
                    injector.remove();
                });
            };

            it('returns correct ids', function () {
                var collection = new GroupCollection(),
                    model = new GroupModel();

                collection.reset([model]);
                expect(model.getGroupId(0)).toBe('A');
                expect(model.getGroupId(1)).toBe('B');
                expect(model.getGroupId(25)).toBe('Z');
                expect(model.getGroupId(702)).toBe('AAA');
                expect(model.getGroupId(704)).toBe('AAC');
                expect(model.getGroupId(475253)).toBe('ZZZZ');
                expect(model.getGroupId(475254)).toBe('AAAAA');
                expect(model.getGroupId(475279)).toBe('AAAAZ');
            });

            it('just 1 character in the dictionary', function () {
                initializeGroupModel('1', this);
                runs(function() {
                    expect(model.getGroupId(0)).toBe('1');
                    expect(model.getGroupId(1)).toBe('11');
                    expect(model.getGroupId(5)).toBe('111111');
                });
            });

            it('allow to use unicode characters in the dict', function () {
                initializeGroupModel('ö诶úeœ', this);
                runs(function() {
                    expect(model.getGroupId(0)).toBe('ö');
                    expect(model.getGroupId(1)).toBe('诶');
                    expect(model.getGroupId(5)).toBe('öö');
                    expect(model.getGroupId(29)).toBe('œœ');
                    expect(model.getGroupId(30)).toBe('ööö');
                    expect(model.getGroupId(43)).toBe('öúe');
                });
            });

            it('return initial value if dictionary is empty', function () {
                initializeGroupModel('', this);
                runs(function() {
                    expect(model.getGroupId(0)).toBe('0');
                    expect(model.getGroupId(5)).toBe('5');
                    expect(model.getGroupId(30)).toBe('30');
                });
            });
        });
    });

    describe('GroupCollection', function() {
        beforeEach(function() {
            this.collection = new GroupCollection();
        });

        it('is empty by default', function() {
            expect(this.collection.isEmpty()).toBeTruthy();
        });

        it('is empty if all groups are empty', function() {
            this.collection.add([{ name: '' }, { name: '' }, { name: '' }]);

            expect(this.collection.isEmpty()).toBeTruthy();
        });

        it('is not empty if a group is not empty', function() {
            this.collection.add([{ name: '' }, { name: 'full' }, { name: '' } ]);

            expect(this.collection.isEmpty()).toBeFalsy();
        });
    });
});
